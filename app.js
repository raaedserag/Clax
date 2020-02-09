//Modules
const startDebugger = require("debug")("app:start"); //create a 'start' debugger
const express = require("express");
const app = express();

//get connectionString, port, jwtKeys
const {connectionString, port, jwtKeys} = require("./startup/config")();

//Data Base
const dataBase = require("./models/db") //{connect, close}

//Routes
require("./startup/routes")(app);


// Initiate the server on the selected PORT
app.listen(port, () => startDebugger(`Listening on port ${port}`));
