const jwt = require("jsonwebtoken");
const jwtKeys = Object.values(require("../startup/config.js").jwtKeys())
//-----------------

module.exports = (req, res, next) => {
  const token = req.header("x-login-token");
  //if token isn't included in the header
  if (!token) return res.status(401).send("Access Denied. No token Provided");

  for (let i = 0; i < jwtKeys.length; i++) {
    try {
      req.user = jwt.verify(token, jwtKeys[i])
      break;
    } catch (error) {
      // If all verifications failed, return unauthorized
      if (i == jwtKeys.length - 1) return res.sendStatus(401)
    }
  }
  next();
}
