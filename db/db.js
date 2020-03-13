//*****Modules*****
const mongoose = require("mongoose");
const dbDebugger = require("debug")("app:db");
const uri = require("../startup/config").connectionString();

//Opening connection, debugged with app:db
//Use => call it with async-await before read or write to database, the connection stills open till closing it.
 const connect = async function(){
  await mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    .then(() => console.log("DB connected..."))
    .catch(err => {
      console.log(` DB connection failed: ${err} \n Reconnecting...`)
      setTimeout(connect, 2000)
      });
};
module.exports.connect = connect;

//Closing connection, debugged with app:db
//Use => call it with async-await after finishing read or write to database.
module.exports.close = async () => {
  await mongoose.connection
    .close()
    .then(() => console.log("DB closed..."))
    .catch(err => console.log("DB clossing failed!!:\n", err));
};
