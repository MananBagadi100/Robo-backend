const { generatePost } = require("../services/openaiService");

// Controller: handles /api/ai/generate
const generateContent = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        // For now, this will call a service function (we’ll implement it next)
        const result = await generatePost(prompt);

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in generateContent:", error);
        return res.status(500).json({
            error: "Failed to generate AI content. Please try again.",
        });
    }
};

module.exports = { generateContent };