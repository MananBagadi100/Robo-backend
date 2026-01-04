const express = require("express");
const router = express.Router();

const { checkHash } = require('../middleware/checkHash')
const { generateContent , getGenerationStatus} = require("../controllers/aiController")
const { aiRateLimiter } = require('./../middleware/checkRateLimits')


// POST: /api/ai/generate
// For generating the post or cacheing req 
router.post("/generate", checkHash ,aiRateLimiter ,generateContent);

//GET : /api/ai/status/:id
// To check status of the processing req (for concurrent req only)
router.get('/status/:id', getGenerationStatus)

module.exports = router;