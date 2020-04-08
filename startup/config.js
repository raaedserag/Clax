const config = require("config");

//Determine Jwt Keys from the environment file
module.exports.jwtKeys = function () {
  const passengerJwt = process.env.JWT_PASSENGER
  const driverJwt = process.env.JWT_DRIVER
  const adminJwt = process.env.JWT_ADMIN
  const tempJwt = process.env.JWT_TEMP
  if (!(passengerJwt && driverJwt && adminJwt && tempJwt)) {
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
  }
  return { passengerJwt, driverJwt, adminJwt, tempJwt };
};

//get port from the configuration file
module.exports.serverConfig = function () {
  const port = config.get("port");
  const host = config.get("host");
  if (!(host && port)) {
    throw new Error("FATAL ERROR: port or host is not defined.");
  }
  return { host, port };
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
  const key = process.env.STRIPE_KEY
  if (!(key)) {
    throw new Error("FATAL ERROR: stripeKey is not defined.");
  }
  return key;
}

//Determine Twilio Credetinals from the environment file
module.exports.twilioCredentials = function () {
  const sid = process.env.TWILIO_SID
  const token = process.env.TWILIO_TOKEN
  const number = process.env.TWILIO_NUMBER
  if (!(sid && token && number)) {
    throw new Error("FATAL ERROR: twilioCredentials is not defined.");
  }
  return { sid, token, number };
};

// Determine Nexmo credentials
module.exports.nexmoCredentials = function () {
  const nexmoKey = process.env.NEXMO_KEY
  const nexmoSecret = process.env.NEXMO_SECRET
  if (!(nexmoKey && nexmoSecret)) {
    throw new Error("FATAL ERROR: nexmoCredentials is not defined.");
  }
  return { nexmoKey, nexmoSecret };
};

// get SendGrid key from the environment file
module.exports.sendGridKey = function () {
  const key = process.env.SENDGRID_KEY
  if (!(key)) {
    throw new Error("FATAL ERROR: sendGridKey is not defined.");
  }
  return key;
}

// get cryptos
module.exports.cryptoKey = function () {
  const cryptoKey = process.env.EXTERNAL_CRYPTO
  if (!(cryptoKey)) {
    throw new Error("FATAL ERROR: cryptoKey is not defined.");
  }
  return cryptoKey;
}

// Get paypal client id and secret from the environment file
module.exports.paypalCredentials = function () {
  const paypalId = process.env.PAYPAL_ID
  const paypalSecret = process.env.PAYPAL_SECRET
  if (!(paypalId && paypalSecret)) {
    throw new Error("FATAL ERROR: paypal creddentials is not defined.");
  }
  return { paypalId, paypalSecret };
}
