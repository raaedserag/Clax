//Modules
const winston = require("winston");
const configuration = require("./startup/config");
const express = require("express");
const app = express();

//load environment variables
require("dotenv").config();

//Logging
require("./startup/logging")();

//Data Base
require("./db/db").connect(); //{connect, close}

app.get("/", (req, res) => res.send("Welcome"));

//Routes
require("./startup/routes")(app);

// Initiate the server on the selected PORT
const { host, port } = configuration.serverConfig();
app.listen(port, () => winston.info(`Listening on port ${port}`));
