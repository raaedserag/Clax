// Modules
const CryptoJS = require("crypto-js");
// Secrets
const {passengerCrypto}= require("../startup/config").cryptos();

// Encode passenger id using crypto and url encoding
module.exports.encodePassengerId = function(id)
{
    return encodeURIComponent(CryptoJS.AES.encrypt(id, passengerCrypto))
}

// Decode passenger id from crypto
module.exports.decodePassengerId = function(encodedId)
{
    return CryptoJS.AES.decrypt(encodedId, passengerCrypto).toString(CryptoJS.enc.Utf8);
}
