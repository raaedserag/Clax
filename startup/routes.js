// Import Modules
const express = require("express");
const morgan = require("morgan");


// Import Middlewares
const error = require("../middlewares/error");
const authentication = require("../middlewares/authentication")


// Import Routes
const complaintRoute=require('../routes/complaints');
const transRoute=require('../routes/transactions');
const offers = require("../routes/offers");
const passengers = require("../routes/passengers");
const passengerLogin = require("../routes/passenger-login");
const transaction = require("../routes/transactions");
const payment = require("../routes/payment")
const pastTrips = require("../routes/past-trips");
const family = require("../routes/family");
const pairing = require('../routes/pairing')



module.exports = function(app) {
    // Apply Essential Middlewares
    app.use(express.json()); // Reparse body of the request into json object
    app.use(express.urlencoded({ extended: true })); // Reparse url to encoded url payload
    //app.use(express.static("public")); // For static files if needed
    
    // Apply MiddleWares
    app.use(error);
    app.use(morgan("tiny"));
    
    // Apply Routes
    app.use("/api/user",complaintRoute);
    app.use("/",transRoute);
    app.use("/api/offers", offers);
    app.use("/api/passengers", passengers);
    app.use("/api/login", passengerLogin);
    app.use("/api/transactions", transaction);
    app.use("/api/payment", payment)
    app.use("/api/past-trips", pastTrips);
    app.use("/api/family", family);
    app.use("/api/pairing",pairing);
};
