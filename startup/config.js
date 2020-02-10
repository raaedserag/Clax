const config = require("config");

//Determine Jwt Keys from the environment file
module.exports.jwtKeys = function() {
  const passengerJwt = process.env.JWTPASSENGER
  const driverJwt = process.env.JWTDRIVER
  const adminJwt = process.env.JWTADMIN
  if (!(userJwt && driverJwt && adminJwt)) {
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
  } 
  return {passengerJwt, driverJwt, adminJwt};
};

//get port from the configuration file
module.exports.port = function() {
const port = config.get("port");
if (!port) {
  throw new Error("FATAL ERROR: port is not defined.");
}
return port;
};

//get connection string from the environment file
module.exports.connectionString = function() {
const connectionString = process.env.URI
if (!(connectionString)) {
  throw new Error("FATAL ERROR: connectionString is not defined.");
}
return connectionString;
}
