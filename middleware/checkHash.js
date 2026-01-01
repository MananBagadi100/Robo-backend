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
    
    //First storing the prompt details and putting status as 'ON_PROGRESS'
    try {
        const [exists] = await pool.query(`INSERT INTO ai_cache (request_hash,prompt,response) VALUES(?,?,?)`,[newHashedPrompt,prompt,null])
        console.log(exists)
            if(exists.affectedRows === 1) {  //If the insertion was successful
                req.prompt = prompt             //Credentials for the next middleware to use
                req.normalizedPrompt = normalizedPrompt
                req.hashedPrompt = newHashedPrompt
                return next()
            }
    }
    catch (error) {         // If same prompt request is processing (by another user, or another tab)
        return res.status(202).json({msg : 'Another same request processing . Please wait for some time',waitTime_in_ms : 3000 })  
    }
}
module.exports = {checkHash}

