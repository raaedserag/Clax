const winston = require("winston");

module.exports = function(err, req, res, next) {
  // winston.error(err.message, err);
  console.log(err);
  res.status(500).send(err);
};
