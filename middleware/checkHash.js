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
    
    //Finding if that particular hash exists in the database
    try {
        const [exists] = await pool.query(`SELECT * FROM ai_cache WHERE request_hash = ?`,[newHashedPrompt])
        if (exists.length === 0) {     //prompt not found in the database
            req.prompt = prompt        //things For the next middleware to access
            req.normalizedPrompt = normalizedPrompt
            req.hashedPrompt = newHashedPrompt
            return next () 
        }
        else {
            res.status(200).json(exists[0].response)
        }
    }
    catch (error) {
        console.log('There is some error with the database queries ')
        return res.status(500).json({msg : 'Internal Server Error. Problem with the database query'})
    }
}
module.exports = {checkHash}

