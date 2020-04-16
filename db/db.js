//*****Modules*****
const mongoose = require("mongoose");
const { localUrl, remoteUrl, dbType } = require("../startup/config").connectionStrings();
const winston = require("winston");

//Opening connection
//Use => call it with async-await before read or write to database, the connection stills open till closing it.
const connect = async function () {
  // By default, db is local
  let url = localUrl;
  // check if dbType is remote
  if (dbType == 'remote') url = remoteUrl;
  await mongoose
    .connect(url, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    .then(() => winston.info(`Connected to ${dbType} DB successfully...`))
    .catch(err => {
      winston.info(`Connection to ${dbType} DB failed: ${err} \n Reconnecting...`);
      setTimeout(connect, 4000);
    });
};
module.exports.connect = connect;

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
