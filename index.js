const express = require("express");
const cors = require("cors");
require("dotenv").config();

const aiRoutes = require("./routes/aiRoutes");

//Middlewares for cors handling and parsing json into readable format
const app = express();
app.use(cors());
app.use(express.json());

// Rate Limiter
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 60 minutes
	limit: 1, // Limit each IP to 2 requests per `window` (here, per 60 minutes).
	standardHeaders: 'draft-8',
	legacyHeaders: false,
    handler : (req,res) => {
        console.log('The IP of the client is ',req.headers['x-forwarded-for'] || req.connection.remoteAddress)
        res.status(429).json({msg : 'Usage Limit Reached . Please try again after an hour'})
    }
})
app.use(limiter)    //apply to all requests 
//Tesing 
app.use('/api/test',(req,res) => {
    res.json({msg : "Hello from server !"})
})
// Routes
app.use("/api/ai", aiRoutes);

const PORT = 3000; 
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});