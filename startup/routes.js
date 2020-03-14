// Import Modules
const express = require("express");
const morgan = require("morgan");
const startDebugger = require("debug")("app:start"); //create a 'start' debugger

// Import Middlewares
const error = require("../middlewares/error");

// Import Routes
const complaintRoute = require("../routes/complaints");
const transRoute = require("../routes/transactions");
const offers = require("../routes/offers");
const passengers = require("../routes/passengers");
const passengerLogin = require("../routes/passenger-login");
const transaction = require("../routes/transactions");
const pastTrips = require("../routes/past-trips");
const family = require("../routes/family");

module.exports = function(app) {
  // Apply Essential Middlewares
  app.use(express.json()); // Reparse body of the request into json object
  app.use(express.urlencoded({ extended: true })); // Reparse url to encoded url payload
  //app.use(express.static("public")); // For static files if needed

  // Apply MiddleWares
  app.use(error);
  app.use(morgan("tiny"));

<<<<<<< HEAD
  // Apply Routes
  app.use("/api/user", complaintRoute);
  app.use("/", transRoute);
  app.use("/api/offers", offers);
  app.use("/api/passengers", passengers);
  app.use("/api/login", passengerLogin);
  app.use("/api/transactions", transaction);
  app.use("/api/past-trips", pastTrips);
  app.use("/api/family", family);

  //apply error handling
  app.use(error);
=======
module.exports = function(app) {
    // Apply Essential Middlewares
    app.use(express.json()); // Reparse body of the request into json object
    app.use(express.urlencoded({ extended: true })); // Reparse url to encoded url payload
    //app.use(express.static("public")); // For static files if needed
    
    // Apply MiddleWares
    app.use(error);

    // Apply Middlewares in Development Mode only
    if (process.env.NODE_ENV == "development")
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
>>>>>>> 769e6e7d99ba4745da97df609c1f009a01df67a7
};
