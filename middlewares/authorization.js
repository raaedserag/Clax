// Passenger Authorization
module.exports.authorizePassenger = (req, res, next) => {
  if (req.user.type != "passenger") return res.sendStatus(403);
  next();
};
// Driver Authorization
module.exports.authorizeDriver = (req, res, next) => {
  if (req.user.type != "driver") return res.sendStatus(403);
  next();
};

// Admin Authorization
module.exports.authorizeAdmin = (req, res, next) => {
  if (req.user.type != "admin") return res.sendStatus(403);
  next();
};
