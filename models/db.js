//*****Modules*****
const mongoose = require('mongoose');
const dbDebugger = require('debug')('app:db');

//Opening connection, debugged with app:db
//Use => call it directly before read or write to database, the connection stills open till closing it.
module.exports.connect = async(URI)=>{
    await mongoose.connect(URI, {useNewUrlParser: true, useFindAndModify: false,
    useUnifiedTopology: true, useCreateIndex: true})
    .then(()=> dbDebugger('DB connected...'))
    .catch((err) => dbDebugger('DB connection failed!!:\n', err));
}

//Closing connection, debugged with app:db
//Use => call it after finishing read or write to database.
module.exports.close = ()=>{
    mongoose.connection.close()
    .then(()=> dbDebugger('DB closed...'))
    .catch((err) => dbDebugger('DB clossing failed!!:\n', err));
}