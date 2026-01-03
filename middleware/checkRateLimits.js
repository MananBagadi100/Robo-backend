//checks rate limits
const rateLimit = require('express-rate-limit')
const aiRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes window
    limit: 3, // Limit each IP to 3 requests per `window` (here, per 10 minutes).
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    validate: {xForwardedForHeader: false}, //To disable check for per user basis (we want globally here)
    handler : (req,res) => {
        console.log('The IP of the client is ',req.connection.remoteAddress)
        res.status(429).json({msg : 'Usage Limit Reached . Please try again after few minutes'})
    }
})
module.exports = {aiRateLimiter}