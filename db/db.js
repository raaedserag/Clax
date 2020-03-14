//*****Modules*****
const mongoose = require("mongoose");
const dbDebugger = require("debug")("app:db");
const uri = require("../startup/config").connectionString();

//Opening connection, debugged with app:db
//Use => call it with async-await before read or write to database, the connection stills open till closing it.
const connect = async function() {
  await mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
      useCreateIndex: true
    })
    .then(() => dbDebugger("DB connected..."))
    .catch(err => {
<<<<<<< HEAD
      console.log(` DB connection failed: ${err} \n Reconnecting...`);
      setTimeout(connect, 2000);
    });
=======
      dbDebugger(` DB connection failed: ${err} \n Reconnecting...`)
      setTimeout(connect, 2000)
      });
>>>>>>> 769e6e7d99ba4745da97df609c1f009a01df67a7
};
module.exports.connect = connect;

//Closing connection, debugged with app:db
//Use => call it with async-await after finishing read or write to database.
module.exports.close = async () => {
  await mongoose.connection
    .close()
    .then(() => dbDebugger("DB closed..."))
    .catch(err => dbDebugger("DB clossing failed!!:\n", err));
};
