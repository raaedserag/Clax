//*****Modules*****
const mongoose = require("mongoose");
const dbDebugger = require("debug")("app:db");
const uri = require("../startup/config").connectionString();

//Opening connection, debugged with app:db
//Use => call it with async-await before read or write to database, the connection stills open till closing it.
module.exports.connect = async () => {
  await mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    .then(() => dbDebugger("DB connected..."))
    .catch(err => dbDebugger("DB connection failed!!:\n", err));
};

//Closing connection, debugged with app:db
//Use => call it with async-await after finishing read or write to database.
module.exports.close = async () => {
  await mongoose.connection
    .close()
    .then(() => dbDebugger("DB closed..."))
    .catch(err => dbDebugger("DB clossing failed!!:\n", err));
};
