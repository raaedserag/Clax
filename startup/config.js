const config = require("config");

module.exports = function() {
  //load environment variables
  require("dotenv").config();
  
  //Determine Jwt Keys from the environment file
  const userJwt = process.env.JWTUSER
  const driverJwt = process.env.JWTDRIVER
  const adminJwt = process.env.JWTADMIN
  if (!(userJwt && driverJwt && adminJwt)) {
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
  } 
  const jwtKeys = {userJwt, driverJwt, adminJwt}

  //get port from the configuration file
  const port = config.get("port");
  if (!port) {
    throw new Error("FATAL ERROR: port is not defined.");
  }
  
  //get connection string from the environment file
  const dbHost = process.env.DBHOST;
  const dbUser = process.env.DBUSER;
  const dbPass = process.env.DBPASS;
  const dbName = process.env.DBNAME;
  if (!(dbHost && dbName && dbPass && dbUser)) {
    throw new Error("FATAL ERROR: db credetinals is not defined.");
  }
  const connectionString = `${dbHost}://${dbUser}:${dbPass}@claxdb-g26dp.gcp.mongodb.net/${dbName}?retryWrites=true&w=majority`;

  //If all is defined
  return{connectionString, port, jwtKeys};
};
