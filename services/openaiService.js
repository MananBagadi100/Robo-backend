const { pool } = require('./../config/db')
const OpenAI = require("openai");
require("dotenv").config();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Generating caption + hashtags + image
const generatePost = async (prompt) => {
    const startTime = Date.now()    // ai latency start time
    try {
        // Generate text: caption + hashtags using GPT-4.1-mini
        const textResponse = await client.chat.completions.create({
            model: "gpt-4o-mini",
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

        // Generate image using gpt-image-1 model
        const imageResponse = await client.images.generate({
            model: "gpt-image-1",
            prompt,
            quality : 'medium',
            size: "1024x1024",
        });

        const base64Image = imageResponse.data[0].b64_json;

        const endTime = Date.now()  //end time
        const aiLatency = endTime - startTime   //Calculating the ai call latency in ms
        //all the metrics
        const textInputTokens = textResponse.usage.prompt_tokens
        const textOutputTokens = textResponse.usage.completion_tokens
        const imageInputTokens = imageResponse.usage.input_tokens
        const imageOutputTokens = imageResponse.usage.output_tokens
        const totalTokens = textInputTokens + textOutputTokens + imageInputTokens + imageOutputTokens

        const answer = {
            result : {
                caption,
                hashtags,
                imageBase64 : base64Image
            },
            metrics : {
                textInputTokens, 
                textOutputTokens, 
                imageInputTokens, 
                imageOutputTokens, 
                totalTokens,
                aiLatency
            }
        }

        return answer
    } catch (error) {
        console.error("Error inside openaiService.generatePost:", error);
        throw new Error("AI generation failed");
    }
};

module.exports = { generatePost };