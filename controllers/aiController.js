const { generatePost } = require("../services/openaiService");
const { costCalculator } = require('./../utils/costCalculator')
const { pool } = require("./../config/db")

// Controller: handles /api/ai/generate
const generateContent = async (req, res) => {
        console.log('the req.normalize prompt is ',req.normalizedPrompt)
        console.log('the req.hashed prompt is ',req.hashedPrompt)
        console.log('the req.prompt is ',req.prompt)

        const normalizedPrompt = req.normalizedPrompt //prompt after normalization
        const insertId = req.insertId   //id of the newly inserted primary req (not for concurrent req)

        try {
            const requestStartTime = Date.now()
            //For generating post from llm
            const answer = await generatePost(normalizedPrompt)
            const {
                textInputTokens,
                textOutputTokens,
                imageInputTokens,
                imageOutputTokens,
                totalTokens,
                aiLatency
            } = answer.metrics
            //updating the api result and status in the database
            try {
                await pool.query(`UPDATE ai_cache 
                    SET response = ? , status = ? , updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? `,
                    [JSON.stringify(answer.result),'DONE',insertId])
                
                const requestEndTime = Date.now()
                const requestLatency = requestEndTime - requestStartTime   //calculating overall request latency in ms

                //calculating the request cost 
                const totalRequestCost = costCalculator(textInputTokens,textOutputTokens,
                    imageInputTokens,imageOutputTokens)

                //storing metrics in database
                try {
                    await pool.query(`INSERT INTO ai_request_metrics 
                        (prompt_id, text_input_tokens, text_output_tokens,
                         image_input_tokens, image_output_tokens, total_tokens_consumed,
                         ai_latency_ms ,latency_ms,openai_cost_microns) 
                        VALUES (?,?,?,?,?,?,?,?,?)`,
                        [insertId,textInputTokens,textOutputTokens,
                            imageInputTokens,imageOutputTokens,totalTokens,
                            aiLatency,requestLatency,totalRequestCost])
                }
                catch (error) {
                    console.log('There was some error in storing the Open AI request metrics')
                    console.log('The error is ',error)
                }

                //If updation of prompt details and metrics were successful
                return res.status(200).json(answer.result)
            }
            //If the updation of the details was not successful
            catch (error) {
                console.log('Some error while updating the llm response details')
                return res.status(500).json({msg : 'Internal Server Error. Problem with updating details in the database'})
            }
        }
        catch (error) {         //if errors while generating post (maybe open ai limit reached , balance is 0 etc !)
            console.log('The error while generating post from llm is',error)
            await pool.query(`UPDATE ai_cache SET status = 'FAILED' 
                WHERE id = ? `,[insertId])
            console.log('Either open ai failed or some error in the generation function')
            return res.status(502).json({msg : 'Open AI Upstream Failed to generate AI content .Please try again '})
        }
};

const getGenerationStatus = async (req,res) => {
    const id = req.params.id    //id of the job creater or primary req
    try {
        const [exists] = await pool.query(`SELECT *
            FROM ai_cache WHERE id = ? `,[id])  //getting the status of the job creater or primary req

        switch (exists[0].status) {
            case 'DONE' : 
                return res.status(200).json(exists[0].response)

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
    }
    catch (error) {
        console.log('THe error is ',error)
        return res.status(500).json({
            msg : 'Internal Server Error. Problem in fetching details from database'
        })
    }
}

module.exports = { generateContent , getGenerationStatus};