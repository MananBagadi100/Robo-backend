const express = require("express");
const router = express.Router();

const { checkHash } = require('../middleware/checkHash')
const { generateContent } = require("../controllers/aiController")
const { aiRateLimiter } = require('./../middleware/checkRateLimits')


// POST: /api/ai/generate
router.post("/generate", checkHash ,aiRateLimiter ,generateContent);

module.exports = router;