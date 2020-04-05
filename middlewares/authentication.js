const jwt = require("jsonwebtoken");
const { adminJwt,
  driverJwt,
  passengerJwt,
  tempJwt } = require("../startup/config.js").jwtKeys


module.exports.authorize = (req, res, next) => {
  const token = req.header("x-temp-token") || req.header("x-login-token");
  if (!token) return res.status(401).send("Access Denied. No token Provided");

  try {
    //if token is valid include decoded info in the request.
    const decoded = jwt.verify(token, tempJwt) ||
      jwt.verify(token, passengerJwt) ||
      jwt.verify(token, driverJwt) ||
      jwt.verify(token, adminJwt)

    req.user = decoded;
    next();
  } catch (ex) {
    //if token is invalid send error message to the user.
    res.status(400).send("Invalid Token.");
  }
}
