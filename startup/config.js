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

//get app-settings from the configuration file
module.exports.appConfig = function () {
  const appSettings = config.get("app_settings");
  if (!(appSettings)) {
    throw new Error("FATAL ERROR: app_settings is not defined.");
  }
  return { appSettings };
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

// Firebase credentials
module.exports.firebaseCredentials = function () {
  const fireBaseUrl = process.env.CLAX_FIREBASE_URL
  if (!(fireBaseUrl)) {
    throw new Error("FATAL ERROR: firebase creddentials is not defined.");
  }
  return {
    firebaseAccount: {
      "type": "service_account",
      "project_id": "sanguine-theory-273017",
      "private_key_id": "2505a6ebee31b87a4c50e52771b1589f90dda48e",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDELOkI6cjHgm29\nZwnThDdzUMsFpwB9QGDcrvKiR5Ue0I+6RslkdEbjx3fOYmm8hy5440396g+C9uoC\nTsRnMb9RmxAv3RyFoIdyEDx8vCHxlQeZfSQG2QSAPODxSg1qCpgma4EPOpSbPCjA\nxM2n1pyYoryC/lmI9IFH0WB9ofuV6ObWX/9qCMFLrfRr6AQGztAAIawdVYKg4jL/\nRKGQifrBZXxtGgQ/MGX4akvScUxJo/SpjXvetiokt+eDDNj0GcfXLZsjWHCbI7Su\n6Dn+BNvvSy6sO2i8xvSNbA4ToXNrvEkNx2W1ITmlRth4DKo2t0qbGVYOeVhcfAwp\nJUdn2owfAgMBAAECggEAEK6U/noK5dRUiqepcUAsCvVS3l8uLnh8BCgoX95gcudf\nYYLFe3Jb2ODMclNyFGMWc5c4uZ/ew89FZP7XusLDNyhNfxR5aW+WNP/mdOD2rflz\nVP0MRDzOIi2LH1mhvGO8PoAj0Gy12GGMQaA6sMwSMvSbvTPt3zSTjczjPKu6niuy\n2fgGX3Es742Tr+kQ6JMfiT0yGIQdIO5uoa5BpKiWTRi2LP2Br262lwN57oPlyryz\nYlZiubMM+TOcBvzEQtT98WWa53tbXk+uPnFTLHw5MZ6YaW/+/fPQU8plhuFy9Z/2\nEGPjTmnSUWnnKNdp98Ly2ZmdNs9z7QUTKLqs9F91qQKBgQDoZGl1evz8HdJlTf/Q\nNf9Wbj42Crru5lwozSB1S83TC/EQeCuwofSPPlhPE/GtkFyvTVxbHFyKQf2j+yYS\nF3xizi9lOGg9s5xDhzJei3Ul0N7SPLKxbWlJ9e+VFtjCqxkW2T9IHeO0WjbHM+aZ\nwWn8hDYDY8CJl1xtxVEAvv71MwKBgQDYGqUUOZMUYoW9cZFBG4vl9i25VfthSgBL\ngubJsbre6kfCd63Bfs5Tr0W2pYRt3Wg/S3tbdg+jFu4F249ZgdWJ25VTUAfomHir\nzzZD6gWkq6O2VJjR3P6oivVcZxSVatVHx2P6Y+DVq4SIwcG0EsYKxLAFbesS0znL\nO3WSLP71ZQKBgHeRCi12vOkektyqd/7xeVFH4Vw+wxUdkrcvaw7OlLSMRVh668ey\nXDjDE/6DvWnWh8luHSGHgxljgJO5KUpPqSDRAtOqZP+yBKk9yy2XxQtS3wH+VtYw\n++Yg0ka7/YSTMZJu7j81ma12aQ6u5mufdt+ESqIN1cc1CEo2Jkoi+ty/AoGAcleG\nyPC9tad7hAU3Ce/9Uauz/cBUxeFVzp5wZn+3lIL5fRe9xAfIO9cdV8q0Cz1/Dx5t\nIrORCoXzYv4NFxrvVYXtuKs7xAIItz9oQv7sBXkbojmYslHwHFWKBV41MenY96W0\nbKO0LtoVwhZi21ijmMcBK55BJzDD/5hyWOmd7VECgYBg3Z1znv3h08YBfC8vm/iW\ncrSjHa3EFj8cuQkBgwNNOS3/S2ZM2BK54j+Rk6WSJf5bJfcEv2F3Z4wpg41iNEGf\nNsN5oboBgDXCSYZQ4TlMz7M58M4Bl+E5exJw0CjAo/UlCKqIKWCManW0Nh0/y893\nGk8ogZAhL+0/g3iEeLA2mA==\n-----END PRIVATE KEY-----\n",
      "client_email": "firebase-adminsdk-q91w5@sanguine-theory-273017.iam.gserviceaccount.com",
      "client_id": "112373563645933213266",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-q91w5%40sanguine-theory-273017.iam.gserviceaccount.com"
    },
    fireBaseUrl
  }
}

// Google Maps API key
module.exports.googleMapsCredentials = function () {
  const googleMapsKey = process.env.CLAX_GOOGLE_MAPS_SECRETS
  if (!(googleMapsKey)) {
    throw new Error("FATAL ERROR: google maps creddentials is not defined.");
  }
  return { googleMapsKey };
}