const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Generating caption + hashtags + image
const generatePost = async (prompt) => {
    try {
        // 1️⃣ Generate text: caption + hashtags using GPT-4.1-mini
        const textResponse = await client.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You generate short catchy social media captions plus 5–8 hashtags.",
                },
                {
                    role: "user",
                    content: `Create a short caption and 8 hashtags for this idea: ${prompt}`,
                },
            ],
        });

        const textOutput = textResponse.choices[0].message.content;
        // Extract caption (first sentence)
        const captionMatch = textOutput.match(/^(.*?)(#|$)/);
        const caption = captionMatch ? captionMatch[1].trim() : textOutput.trim();

        // Extract hashtags (all words starting with '#')
        const hashtags = textOutput
            .split(/\s+/)
            .filter((word) => word.startsWith("#"))
            .map((tag) => tag.trim());

        // 2️⃣ Generate image using gpt-image-1
        const imageResponse = await client.images.generate({
            model: "gpt-image-1",
            prompt,
            size: "1024x1024",
        });

        const base64Image = imageResponse.data[0].b64_json;

        return {
            caption,
            hashtags,
            imageBase64: base64Image,
        };
    } catch (error) {
        console.error("Error inside openaiService.generatePost:", error);
        throw new Error("AI generation failed");
    }
};

module.exports = { generatePost };