const express = require("express");
const router = express.Router();

const { generateContent } = require("../controllers/aiController");

// POST: /api/ai/generate
router.post("/generate", generateContent);

module.exports = router;