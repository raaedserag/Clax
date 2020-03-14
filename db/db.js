//*****Modules*****
const mongoose = require("mongoose");
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
    .then(() => winston.info("DB connected..."))
    .catch(err => {
      winston.info(` DB connection failed: ${err} \n Reconnecting...`)
      setTimeout(connect, 4000)
      });
};
module.exports.connect = connect;

//Closing connection, debugged with app:db
//Use => call it with async-await after finishing read or write to database.
module.exports.close = async () => {
  await mongoose.connection
    .close()
    .then(() => winston.info("DB closed..."))
    .catch(err => winston.info("DB clossing failed!!:\n", err));
};
