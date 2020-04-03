const config = require("config");

//Determine Jwt Keys from the environment file
module.exports.jwtKeys = function () {
  const passengerJwt = process.env.JWTPASSENGER
  const driverJwt = process.env.JWTDRIVER
  const adminJwt = process.env.JWTADMIN
  if (!(passengerJwt && driverJwt && adminJwt)) {
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
  }
  return { passengerJwt, driverJwt, adminJwt };
};

//get port from the configuration file
module.exports.port = function () {
  const port = config.get("port");
  if (!port) {
    throw new Error("FATAL ERROR: port is not defined.");
  }
  return port;
};

//get connection string from the environment file
module.exports.connectionString = function () {
  const connectionString = process.env.URI
  if (!(connectionString)) {
    throw new Error("FATAL ERROR: connectionString is not defined.");
  }
  return connectionString;
}

// get stripe key from the environment file
module.exports.stripeKey = function () {
  const key = process.env.STRIPEKEY
  if (!(key)) {
    throw new Error("FATAL ERROR: stripeKey is not defined.");
  }
  return key;
}

//Determine Twilio Credetinals from the environment file
module.exports.twilioCredentials = function () {
  const sid = process.env.TWILIOSID
  const token = process.env.TWILIOTOKEN
  const number = process.env.TWILIONUMBER
  if (!(sid && token && number)) {
    throw new Error("FATAL ERROR: twilioCredentials is not defined.");
  }
  return { sid, token, number };
};

// Determine Nexmo credentials
module.exports.nexmoCredentials = function () {
  const nexmoKey = process.env.NEXMOKEY
  const nexmoSecret = process.env.NEXMOSECRET
  if (!(nexmoKey && nexmoSecret)) {
    throw new Error("FATAL ERROR: nexmoCredentials is not defined.");
  }
  return { nexmoKey, nexmoSecret };
};

// get SendGrid key from the environment file
module.exports.sendGridKey = function () {
  const key = process.env.SENDGRIDKEY
  if (!(key)) {
    throw new Error("FATAL ERROR: sendGridKey is not defined.");
  }
  return key;
}

// get cryptos
module.exports.cryptoKey = function () {
  const cryptoKey = process.env.EXTERNALCRYPTO
  if (!(cryptoKey)) {
    throw new Error("FATAL ERROR: cryptoKey is not defined.");
  }
  return cryptoKey;
}
