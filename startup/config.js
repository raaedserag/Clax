const config = require("config");

//Determine Jwt Keys from the environment file
module.exports.jwtKeys = function () {
  const passengerJwt = process.env.CLAX_JWT_PASSENGER,
    driverJwt = process.env.CLAX_JWT_DRIVER,
    adminJwt = process.env.CLAX_JWT_ADMIN,
    tempJwt = process.env.CLAX_JWT_TEMP
  if (!(passengerJwt && driverJwt && adminJwt && tempJwt)) {
    throw new Error("FATAL ERROR: jwtPrivateKey is not defined.");
  }
  return { passengerJwt, driverJwt, adminJwt, tempJwt };
};

//get port from the configuration file
module.exports.serverConfig = function () {
  const port = config.get("port"),
    host = config.get("host");
  if (!(host && port)) {
    throw new Error("FATAL ERROR: port or host is not defined.");
  }
  return { host, port };
};

//get connection string from the environment file
module.exports.dbConfig = function () {
  const localUri = process.env.CLAX_LOCAL_DB_URI,
    atlasUri = process.env.CLAX_ATLAS_DB_URI,
    cosmosUri = process.env.CLAX_COSMOS_DB_URI,
    cosmosUser = process.env.CLAX_COSMOS_DB_USER,
    cosmosPass = process.env.CLAX_COSMOS_DB_PASS,
    dbType = config.get("dbType")
  if (!(localUri && atlasUri && cosmosUri && cosmosUser, cosmosPass)) {
    //throw new Error("FATAL ERROR: dbConfig is not defined.");
  }
  if (!(dbType == 'local' || dbType == 'atlas' || dbType == 'cosmos')) {
    throw new Error("FATAL ERROR: dbType should be one of [local, atlas, cosmos] only.");
  }
  return { localUri, atlasUri, cosmosUri, cosmosUser, cosmosPass, dbType };
}

// get stripe key from the environment file
module.exports.stripeKey = function () {
  const key = process.env.CLAX_STRIPE_KEY
  if (!(key)) {
    throw new Error("FATAL ERROR: stripeKey is not defined.");
  }
  return key;
}

//Determine Twilio Credetinals from the environment file
module.exports.twilioCredentials = function () {
  const sid = process.env.CLAX_TWILIO_SID,
    token = process.env.CLAX_TWILIO_TOKEN,
    number = process.env.CLAX_TWILIO_NUMBER
  if (!(sid && token && number)) {
    throw new Error("FATAL ERROR: twilioCredentials is not defined.");
  }
  return { sid, token, number };
};

// Determine Nexmo credentials
module.exports.nexmoCredentials = function () {
  const nexmoKey = process.env.CLAX_NEXMO_KEY,
    nexmoSecret = process.env.CLAX_NEXMO_SECRET
  if (!(nexmoKey && nexmoSecret)) {
    throw new Error("FATAL ERROR: nexmoCredentials is not defined.");
  }
  return { nexmoKey, nexmoSecret };
};

// get SendGrid key from the environment file
module.exports.sendGridKey = function () {
  const key = process.env.CLAX_SENDGRID_KEY
  if (!(key)) {
    throw new Error("FATAL ERROR: sendGridKey is not defined.");
  }
  return key;
}

// get cryptos
module.exports.cryptoKey = function () {
  const cryptoKey = process.env.CLAX_EXTERNAL_CRYPTO
  if (!(cryptoKey)) {
    throw new Error("FATAL ERROR: cryptoKey is not defined.");
  }
  return cryptoKey;
}

// Get paypal client id and secret from the environment file
module.exports.paypalCredentials = function () {
  const paypalId = process.env.CLAX_PAYPAL_ID,
    paypalSecret = process.env.CLAX_PAYPAL_SECRET
  if (!(paypalId && paypalSecret)) {
    throw new Error("FATAL ERROR: paypal creddentials is not defined.");
  }
  return { paypalId, paypalSecret };
}
