const { generatePost } = require("../services/openaiService");

// Controller: handles /api/ai/generate
const generateContent = async (req, res) => {
    try {
        console.log('the req.body is ',req.body)
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
            return res.status(400).json({ msg: "Prompt is required" });
        }

        // For generating the post
        const result = await generatePost(prompt);

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in generateContent:", error);
        return res.status(500).json({
            msg: "Failed to generate AI content. Please try again.",
        });
    }
};

module.exports = { generateContent };