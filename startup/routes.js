// Import Modules
const express = require("express");
const morgan = require("morgan");


// Import Middlewares
//const error = require("../middlewares/error");


// Import Routes
const stationRoute=require('../routes/stations');
const linesRoute=require('../routes/lines');
const driversRoute=require('../routes/driver');

module.exports = function(app) {
    // Apply Essential Middlewares
    app.use(express.json()); // Reparse body of the request into json object
    app.use(express.urlencoded({ extended: true })); // Reparse url to encoded url payload
    //app.use(express.static("public")); // For static files if needed
    
    // Apply Middlewares in development mode only
    if(app.get('env') === 'development')
    {
        console.log("Moorgan Enabled")
        app.use(morgan("tiny"));
    }
    

    // Apply Routes
    app.use("/api/user",stationRoute);
    app.use("/api/user",linesRoute);
    app.use("/api/user",driversRoute); 


};