//Modules
const configuration = require("./startup/config");
const startDebugger = require("debug")("app:start"); //create a 'start' debugger
const express = require("express");
const app = express();

//load environment variables
require("dotenv").config();

//Data Base
const dataBase = require("./db/db").connect(); //{connect, close}

//Routes
require("./startup/routes")(app);

// Initiate the server on the selected PORT
const port = configuration.port();
app.listen(port, () => startDebugger(`Listening on port ${port}`));
