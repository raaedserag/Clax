const jwt = require("jsonwebtoken");
const { adminJwt,
  driverJwt,
  passengerJwt,
  tempJwt } = require("../startup/config.js").jwtKeys


module.exports = (req, res, next) => {

  next();
}
