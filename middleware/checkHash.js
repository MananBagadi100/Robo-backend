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
    //Block for concurrent req (not unique req) by other users, tabs etc
    catch (error) {         
        try {
            const [exists] = await pool.query(`SELECT * FROM ai_cache     
                WHERE request_hash = ? AND status = 'DONE'`,
                [newHashedPrompt])              //If that same prompt req is processed successfully (status is DONE)
            console.log('the catch block result is ',exists[0])
            return res.status(200).json(exists[0].response) //return its response to all other same req (made by multiple users or tabs etc)
        }
        catch (error) {     //If the prompt req is still processing we tell other same req to try again after the specificed wait time
            console.log('the error in finding the done req is ',error)
            return res.status(202).json({msg : 'Another same request processing . Please wait for some time',waitTime_in_ms : 3000 })  
        }
        
    }
}
module.exports = {checkHash}

