const { USD_TO_MICRONS } = require("../config/constants")

const getMicronsPerToken = (priceInUSD) => {
    //First we find how many microns in given price
    const totalMicrons = priceInUSD * USD_TO_MICRONS
    //Now we find now many microns we get in one token
    const micronsPerToken = totalMicrons / 1000000
    return micronsPerToken
}

module.exports = { getMicronsPerToken }