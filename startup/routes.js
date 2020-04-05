// Import Modules
const express = require("express");
const morgan = require("morgan");

// Import Middlewares
const error = require("../middlewares/error");
const authentication = require("../middlewares/authentication");

// Import Routes
// Login & Registration
const signingRoute = require("../routes/signing/signing-route");
// Home Screen Section
const pastTripsRoute = require("../routes/home/past-trips-route");
const familyRoute = require("../routes/home/family-route");
const offersRoute = require("../routes/home/offers-route");
const settingsRoute = require("../routes/home/settings-route")
// Payments & Complains Section
const complaintRoute = require("../routes/payment/complains-route");
const manageFinancialsRoute = require("../routes/payment/manage-financials-route");
const loaningRoute = require("../routes/payment/loaning-route");
const paypal = require("../routes/payment/paypal-route");
// Pairing & Tracking Section
const pairing = require("../routes/pairing/pairing");
// Externals Section
const passengerExternal = require('../routes/clients/passenger-external-route')


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
  app.use("/api/signing", signingRoute);
  // Home Screen Section
  app.use("/api/passengers/settings", authentication, settingsRoute);
  app.use("/api/passengers/family", authentication, familyRoute);
  app.use("/api/passengers/offers", authentication, offersRoute);
  app.use("/api/passengers/past-trips", pastTripsRoute);
  // Payments & Complains Section
  app.use("/api/passengers/complains", authentication, complaintRoute);
  app.use("/api/passengers/payments/manage-financials", authentication, manageFinancialsRoute);
  app.use("/api/passengers/payments/loaning", authentication, loaningRoute);
  app.use("/api/passengers/paypal", paypal);
  // Pairing & Tracking Section
  app.use("/api/pairing", pairing);
  // Externals Section
  app.use("/clients/passengers", passengerExternal)


  // Apply Error Middle ware
  app.use(error);
};
