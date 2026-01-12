//To Store all constants for easy access
//conversion metrics
const USD_TO_MICRONS = 1000000  //means 1 usd = how many microns

//open ai api costs
const OPENAI_PRICING_USD = {        //all prices in USD
    GPT4O_MINI : {                  //model name
        TEXT_INPUT_PER_M_TOKENS : 0.15,
        TEXT_OUTPUT_PER_M_TOKENS : 0.60
    },
    GPT_IMAGE_1 : {
        IMAGE_INPUT_PER_M_TOKENS : 10,
        IMAGE_OUTPUT_PER_M_TOKENS : 40
    }
}

module.exports = {USD_TO_MICRONS, OPENAI_PRICING_USD}