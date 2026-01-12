const { pool } = require('./../config/db')

const metricsSummary = async (req,res) => {
    //we are fetching individual metric values from the database 
    try {
        const [rows] = await pool.query(`
            SELECT 
            c.id, c.prompt, c.status,
            m.total_tokens_consumed, m.latency_ms, m.openai_cost_microns
            FROM ai_cache c
            JOIN ai_request_metrics m ON c.id = m.prompt_id
            ORDER BY c.created_at DESC;
        `)
        console.log('the rows are ',rows)
        //then fetching the overall aggregated metrics
        try {
            const [metrics] = await pool.query(`
                SELECT 
                    AVG(total_tokens_consumed) as avgTokensConsumedPerRequest,
                    AVG(latency_ms) as avgRequestLatency,
                    SUM(COALESCE(openai_cost_microns,0)) as totalApiSpend
                FROM ai_request_metrics
            `)
            console.log("------------------------------------------------------")
            console.log(metrics)
            return res.status(200).json({msg : 'Nice'})
        }
        catch (error) {
            console.log('There was some error in fetching the aggregated metrics',error)
            res.status(500).json({msg : "not good"})
        }
    }
    catch (error) {
        console.log('There is some error in fetching the database rows',error)
        res.status(500).json({msg : 'Internal Server Error. Error in fetching metrics from database'})
    }
}
module.exports = { metricsSummary }