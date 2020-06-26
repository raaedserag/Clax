// Modules
const CryptoJS = require("crypto-js");
const bcrypt = require("bcrypt");
// Secrets
const cryptoKey = require("../startup/config").cryptoKey();
const { tempJwt } = require("../startup/config").jwtKeys();

//----------------

// Encode passenger id using crypto and url encoding
module.exports.encodeId = function (id) {
  return encodeURIComponent(
    CryptoJS.AES.encrypt(id.toString(), cryptoKey).toString()
  );
};

// Decode passenger id from crypto
module.exports.decodeId = function (encodedId) {
  return CryptoJS.AES.decrypt(
    decodeURIComponent(encodedId.toString()),
    cryptoKey
  ).toString(CryptoJS.enc.Utf8);
};

module.exports.hashing = async function (pass) {
  return await bcrypt.hash(pass, await bcrypt.genSalt(10));
};

// Temp Token
module.exports.generateTempToken = function (id, is_passenger = true) {
  return jwt.sign(
    {
      _id: id,
      is_passenger,
    },
    tempJwt,
    { expiresIn: "1h" }
  );
};
