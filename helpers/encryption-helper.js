// Modules
const CryptoJS = require("crypto-js");
const bcrypt = require("bcrypt");
//----------------

// Secrets
const { passengerCrypto } = require("../startup/config").cryptos();

// Encode passenger id using crypto and url encoding
module.exports.encodeId = function (id) {
  return encodeURIComponent(CryptoJS.AES.encrypt(id, passengerCrypto));
};

// Decode passenger id from crypto
module.exports.decodeId = function (encodedId) {
  return CryptoJS.AES.decrypt(encodedId, passengerCrypto).toString(
    CryptoJS.enc.Utf8
  );
};

module.exports.hashingPassword = async function (pass) {
  return await bcrypt.hash(pass, await bcrypt.genSalt(10));
};
