const jwt = require("jsonwebtoken");
const { adminJwt } = require("../startup/config.js").jwtKeys();
async function authorize(req, res, next) {
  const token = req.header("x-login-token");
  //if token isn't included in the header
  if (!token) return res.status(401).send("Access Denied. No token Provided");

  try {
    //if token is valid include decoded info in the request.
    const decoded = jwt.verify(token, adminJwt);
    req.admin = decoded;
    next();
  } catch (ex) {
    //if token is invalid send error message to the user.
    res.status(400).send("Invalid Token.");
  }
}
module.exports = authorize;
