// Import Modules
const express = require("express");
const morgan = require("morgan");

// Import Middlewares
const error = require("../middlewares/error");
const authentication = require("../middlewares/authentication");

// Import Routes
// Login & Registration
const passengerSigningRoute = require("../routes/signing/passenger-signing-route");
// Home Screen Section
const settingsRoute = require("../routes/home/settings-route");
const pastTripsRoute = require("../routes/home/past-trips-route");
const familyRoute = require("../routes/home/family-route");
const offersRoute = require("../routes/home/offers-route");
// Payments & Complains Section
const complaintRoute = require("../routes/payment/complains-route");
const manageFinancialsRoute = require("../routes/payment/manage-financials-route");
const loaningRoute = require("../routes/payment/loaning-route");
const paypal = require("../routes/payment/paypal-route");
// Pairing & Tracking Section
const pairing = require("../routes/pairing/pairing");
// Externals Section
const passengerExternal = require("../routes/clients/passengerExternal-route");

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
  app.use("/api/signing", passengerSigningRoute);
  // Home Screen Section
  app.use("/api/passengers/settings", authentication, settingsRoute);
  app.use("/api/passengers/family", authentication, familyRoute);
  app.use("/api/passengers/offers", authentication, offersRoute);
  app.use("/api/passengers/past-trips", authentication, pastTripsRoute);
  // Payments & Complains Section
  app.use("/api/passengers/complains", authentication, complaintRoute);
  app.use(
    "/api/passengers/payments/manage-financials",
    authentication,
    manageFinancialsRoute
  );
  app.use("/api/passengers/payments/loaning", authentication, loaningRoute);
  app.use("/api/passengers/paypal", paypal);
  // Pairing & Tracking Section
  app.use("/api/pairing", pairing);
  // Externals Section
  app.use("/clients/passengers", passengerExternal);

  // Apply Error Middle ware
  app.use(error);
  const complaintRoute = require("../routes/payment/complaints");
  const offers = require("../routes/home/offers");
  const passengers = require("../routes/home/passengers");
  const transaction = require("../routes/payment/transactions");
  const payment = require("../routes/payment/payment");
  const pastTrips = require("../routes/home/past-trips");
  const family = require("../routes/home/family");
  const pairing = require("../routes/pairing/pairing");
  const admin = require("../routes/home/admin");

  module.exports = function (app) {
    // Apply Essential Middlewares
    app.use(express.json()); // Reparse body of the request into json object
    app.use(express.urlencoded({ extended: true })); // Reparse url to encoded url payload
    //app.use(express.static("public")); // For static files if needed
    app.use(function (req, res, next) {
      // Website you wish to allow to connect
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");

      // Request methods you wish to allow
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
      );

      // Request headers you wish to allow
      res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type,x-login-token"
      );

      // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
      res.setHeader("Access-Control-Allow-Credentials", true);

      // Pass to next layer of middleware
      next();
    });
    // Apply Morgan middleware in development mode
    if (process.env.NODE_ENV == "development") {
      app.use(morgan("tiny"));
    }

    // Apply Routes
    app.use("/api/user", complaintRoute);
    app.use("/api/offers", offers);
    app.use("/api/passengers", passengers);
    app.use("/api/transactions", transaction);
    app.use("/api/payment", payment);
    app.use("/api/past-trips", pastTrips);
    app.use("/api/family", family);
    app.use("/api/pairing", pairing);
    app.use("/api/admin", admin);

    // Apply Error Middleware
    app.use(error);
  };
};
