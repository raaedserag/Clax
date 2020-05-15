//*****Modules*****
const mongoose = require("mongoose");
const winston = require("winston");
// Configuration
const { localUri,
  atlasUri,
  cosmosUri,
  cosmosUser,
  cosmosPass,
  dbType } = require("../startup/config").dbConfig();
//-------------------------------------------------------

// Connecting mongoose to Cosmos
const localConnect = async function () {
  await mongoose.connect(localUri, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
}

// Connecting mongoose to Cosmos
const cosmosConnect = async function () {
  await mongoose.connect(cosmosUri, {
    auth: {
      user: cosmosUser,
      password: cosmosPass
    },
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
}
// Connecting mongoose to Atlas
const atlasConnect = async function () {
  await mongoose
    .connect(atlasUri, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
}

//Opening connection
//Use => call it with async-await before read or write to database, the connection stills open till closing it.
module.exports.connect = async function () {
  try {
    if (dbType == 'cosmos') await cosmosConnect();
    else if (dbType == 'atlas') await atlasConnect();
    else await localConnect();

    winston.info(`Connected to ${dbType} DB successfully`)
  } catch (error) {
    winston.info(`Connection to ${dbType} DB failed: ${error} \n Reconnecting...`);
    setTimeout(await this.connect(), 4000);
  }
};

//Closing connection
//Use => call it with async-await after finishing read or write to database.
module.exports.close = async () => {
  await mongoose.connection
    .close()
    .then(() => winston.info(`${dbType} DB closed...`))
    .catch(err => winston.info(`${dbType} DB clossing failed!!:\n ${err}`));
};

module.exports.startTransaction = async function () {
  let session = await mongoose.startSession();
  await session.startTransaction();
  return session;
};
