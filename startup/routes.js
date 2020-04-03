// Import Modules
const express = require("express");
const morgan = require("morgan");

// Import Middlewares
const error = require("../middlewares/error");
const authentication = require("../middlewares/authentication");

// Import Routes
// Login & Registration
const passengers = require("../routes/home/passengers");
const passengerLogin = require("../routes/home/passenger-login");
// Home Screen Section
const pastTrips = require("../routes/home/past-trips");
const family = require("../routes/home/family");
const offers = require("../routes/home/offers");
// Payments & Complains Section
const complaintRoute = require("../routes/payment/complains-route");
const manageFinancialsRoute = require("../routes/payment/manage-financials-route");
const loaningRoute = require("../routes/payment/loaning-route");
const paypal = require("../routes/payment/paypal-route");
// Pairing & Tracking Section
const pairing = require("../routes/pairing/pairing");
// Externals Section


module.exports = function (app) {
  // Apply Essential Middlewares
  app.use(express.json()); // Reparse body of the request into json object
  app.use(express.urlencoded({ extended: true })); // Reparse url to encoded url payload
  //app.use(express.static("public")); // For static files if needed

  // Apply Morgan middleware in development mode
  if (process.env.NODE_ENV == "development") {
    app.use(morgan("tiny"));
  }

  // Apply Routes
  // Login & Registration
  app.use("/api/login", passengerLogin);
  // Home Screen Section
  app.use("/api/passengers", passengers);
  app.use("/api/family", family);
  app.use("/api/offers", offers);
  app.use("/api/past-trips", pastTrips);
  // Payments & Complains Section
  app.use("/api/passengers/complains", authentication, complaintRoute);
  app.use("/api/passengers/payments/manage-financials", authentication, manageFinancialsRoute);
  app.use("/api/passengers/payments/loaning", authentication, loaningRoute);
  app.use("/api/paypal", authentication, paypal);
  // Pairing & Tracking Section
  app.use("/api/pairing", pairing);
  // Externals Section


  // Apply Error Middle ware
  app.use(error);
};
