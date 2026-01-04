const crypto = require('crypto')
const {pool} = require('./../config/db')
async function checkHash(req,res,next) {
    const { prompt } = req.body

    if (!prompt || typeof prompt !== 'string') {        //if prompt is not a string
        res.status(400).json({msg : 'Invalid Prompt'})
    }
    const normalizedPrompt = prompt                    
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9.,?' ']/g,'')
        .replace(/\s+/g,' ')
    //Hashing the prompt after normalization
    const newHashedPrompt = crypto.createHash('sha256').update(normalizedPrompt).digest('hex')
    
    //First storing the prompt details for unique prompts and putting status as 'ON_PROGRESS'
    try {
        const [exists] = await pool.query(`INSERT INTO ai_cache (request_hash,prompt,response) 
            VALUES(?,?,?)`,
            [newHashedPrompt,prompt,null])
        console.log(exists)
            if(exists.affectedRows === 1) {  //If the insertion was successful
                req.prompt = prompt             //Credentials for the next middleware to use
                req.normalizedPrompt = normalizedPrompt
                req.hashedPrompt = newHashedPrompt
                req.insertId = exists.insertId      //id of the newly inserted row (not for concurrent req)
                return next()
            }
    }
    //Code for concurrent req for eg same req by other users, tabs etc
    catch (error) {         
        try {
            const [exists] = await pool.query(`SELECT * FROM ai_cache     
                WHERE request_hash = ? `,
                [newHashedPrompt])              //Fetching the details for the primary request
            console.log('the catch block result is ',exists[0])

            switch (exists[0].status) {         //First checking the status of primary request
                case 'DONE' : 
                    return res.status(200).json(exists[0].response)
                
                case 'IN_PROGRESS' :
                    return res.status(202).json({
                        msg : 'Another same request processing . Please wait for some time',
                        waitTime_in_ms : 3000 ,
                        jobId : exists[0].id        //id of the primary req
                    })  
            }
        }
        catch (error) {     //If the prompt req is still processing we tell other same req to try again after the specificed wait time
            console.log('Unable to fetch the primary req details . The Error is : ',error)
            return res.status(500).json({msg : 'Internal Server Error . Unable to fetch the req details'})  
        }
        
    }
}
module.exports = {checkHash}

    