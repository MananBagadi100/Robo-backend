const { generatePost } = require("../services/openaiService");
const { pool } = require("./../config/db")

// Controller: handles /api/ai/generate
const generateContent = async (req, res) => {
        console.log('the req.normalize prompt is ',req.normalizedPrompt)
        console.log('the req.hashed prompt is ',req.hashedPrompt)
        console.log('the req.prompt is ',req.prompt)

        const hashedPrompt = req.hashedPrompt         //normalized hashed prompt
        const normalizedPrompt = req.normalizedPrompt //prompt after normalization
        const prompt = req.prompt                     //intial Prompt given by the user

        try {
            //For generating post
            const result = await generatePost(normalizedPrompt)
            //Storing the prompt in database for future - indempotency concept
            try {
                await pool.query(`INSERT INTO ai_cache (request_hash ,prompt,response) VALUES (?,?,?) `,[hashedPrompt,normalizedPrompt,JSON.stringify(result)])
            }
            //If storing prompt details was unsuccessful
            catch (error) {
                console.log('There is some error with the database')
                return res.status(500).json({msg : 'Internal Server Error. Problem with the database query'})
            }
            //If Storing the prompt details was successful in the database
            return res.status(200).json(result)
        }
        catch (error) {
            console.log('The error is',error)
            return res.status(500).json({msg : 'Internal Server Error. Failed to generate AI content .Please try again '})
        }
};

module.exports = { generateContent };