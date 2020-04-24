// Import Modules
const express = require("express");
const morgan = require("morgan");

// Import Middlewares
const error = require("../middlewares/error");
const authentication = require("../middlewares/authentication");
const webConfig = require("../middlewares/web-config");

// Import Routes
// Login & Registration
const passengerSigningRoute = require("../routes/signing/passenger-signing-route");
const admin = require("../routes/home/admin-route");
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
// Server Interface
const serverInterfaceRoute = require("../routes/clients/serverInterface-route")

module.exports = function (app) {
  // Apply Essential Middlewares
  app.use(webConfig);
  app.use(express.json()); // Reparse body of the request into json object
  app.use(express.urlencoded({ extended: true })); // Reparse url to encoded url payload
  app.use(express.static("public")); // For static files if needed

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
  app.use("/api/admin", admin);
  // Server Interface
  //app.use("/", serverInterfaceRoute)
  app.get('/', serverInterfaceRoute)
  // Handle Not found pages
  app.all('*', (req, res) => res.sendStatus(404))
  // Apply Error Middle ware
  app.use(error);
};
