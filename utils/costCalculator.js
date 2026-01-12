const { OPENAI_PRICING_USD , USD_TO_MICRONS } = require('./../config/constants')
const { getMicronsPerToken } = require('./micronsPerTokenCalculator')

function costCalculator (textInputTokens, textOutputTokens, imageInputTokens, imageOutputTokens) {
    // Convert the open ai cost in USD (the constants) to microns first !
    // Here we find in one token how many microns (different for input , output , model etc)
    const textInputMicronsPerToken = getMicronsPerToken(OPENAI_PRICING_USD.GPT4O_MINI.TEXT_INPUT_PER_M_TOKENS)
    const textOutputMicronsPerToken = getMicronsPerToken(OPENAI_PRICING_USD.GPT4O_MINI.TEXT_OUTPUT_PER_M_TOKENS)
    const imageInputMicronsPerToken = getMicronsPerToken(OPENAI_PRICING_USD.GPT_IMAGE_1.IMAGE_INPUT_PER_M_TOKENS)
    const imageOutputMicronsPerToken = getMicronsPerToken(OPENAI_PRICING_USD.GPT_IMAGE_1.IMAGE_OUTPUT_PER_M_TOKENS)

    //Now calculating the cost (in microns) for the specfied number of tokens
    const textInputCosts = textInputMicronsPerToken * textInputTokens
    const textOutputCosts = textOutputMicronsPerToken * textOutputTokens
    const imageInputCosts = imageInputMicronsPerToken * imageInputTokens
    const imageOutputCosts = imageOutputMicronsPerToken * imageOutputTokens

    //Calculating the total cost of that request (in microns)
    const totalRequestCost = textInputCosts + textOutputCosts + imageInputCosts + imageOutputCosts
    
    return totalRequestCost

}
module.exports = { costCalculator }