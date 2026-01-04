const { generatePost } = require("../services/openaiService");
const { pool } = require("./../config/db")

// Controller: handles /api/ai/generate
const generateContent = async (req, res) => {
        console.log('the req.normalize prompt is ',req.normalizedPrompt)
        console.log('the req.hashed prompt is ',req.hashedPrompt)
        console.log('the req.prompt is ',req.prompt)

        const normalizedPrompt = req.normalizedPrompt //prompt after normalization
        const insertId = req.insertId   //id of the newly inserted prompt row (not for concurrent req !)

        try {
            //For generating post from llm
            const result = await generatePost(normalizedPrompt)
            //updating and result and status in the database
            try {
                await pool.query(`UPDATE ai_cache 
                    SET response = ? , status = ? , updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? `,
                    [JSON.stringify(result),'DONE',insertId])

                //If updating the prompt details was successful in the database
                return res.status(200).json(result)
            }
            //If the updation of the details was not successful
            catch (error) {
                console.log('Some error while updating the llm response details')
                return res.status(500).json({msg : 'Internal Server Error. Problem with updating details in the database'})
            }

        }
        catch (error) {
            console.log('The error while generating post from llm is',error)
            return res.status(500).json({msg : 'Internal Server Error. Failed to generate AI content .Please try again '})
        }
};

const getGenerationStatus = async (req,res) => {
    const id = req.params.id    //id of the job creater or primary req
    try {
        const [exists] = await pool.query(`SELECT *
            FROM ai_cache WHERE id = ? `,[id])  //getting the status of the job creater or primary req
        console.log(exists[0].status)
        switch (exists[0].status) {
            case 'DONE' : 
                return res.status(200).json({
                    status : exists[0].status,
                    result : exists[0].response
                })

            case 'IN_PROGRESS' : 
                return res.status(202).json({
                    status : exists[0].status,
                    waitTime_in_ms : 3000,
                    jobId : exists[0].id      //id of the job creator or primary req
                })

            case 'FAILED' : 
                return res.status(200).json({
                    status : exists[0].status,
                    jobId : exists[0].id,
                    msg : 'Primary request failed due to some reason'
                })
                
        }
        return res.json({msg : "fetched"})
    }
    catch (error) {
        console.log('THe error is ',error)
    }
}

module.exports = { generateContent , getGenerationStatus};