// Import Modules
const express = require("express");
const morgan = require("morgan");


// Import Middlewares
const error = require("../middlewares/error");
const authentication = require("../middlewares/authentication");




// Import Routes
const complaintRoute=require('../routes/payment/complaints');
const offers = require("../routes/home/offers");
const passengers = require("../routes/home/passengers");
const passengerLogin = require("../routes/home/passenger-login");
const transaction = require("../routes/payment/transactions");
const payment = require("../routes/payment/payment")
const pastTrips = require("../routes/home/past-trips");
const family = require("../routes/home/family")
const pairing = require('../routes/pairing/pairing')



module.exports = function(app) {
    // Apply Essential Middlewares
    app.use(express.json()); // Reparse body of the request into json object
    app.use(express.urlencoded({ extended: true })); // Reparse url to encoded url payload
    //app.use(express.static("public")); // For static files if needed
    
    // Apply Morgan middleware in development mode
    if(process.env.NODE_ENV == "development")
    {
        app.use(morgan("tiny"));
    }
    
    
    // Apply Routes
    app.use("/api/user",complaintRoute);
    app.use("/api/offers", offers);
    app.use("/api/passengers", passengers);
    app.use("/api/login", passengerLogin);
    app.use("/api/transactions", transaction);
    app.use("/api/payment", payment)
    app.use("/api/past-trips", pastTrips);
    app.use("/api/family", family);
    app.use("/api/pairing",pairing);

    // Apply Error Middle ware
    app.use(error);
};
