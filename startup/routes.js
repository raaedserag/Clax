// Import Modules
const express = require("express");

// Import Middlewares
const error = require("../middlewares/error");
const authentication = require("../middlewares/authentication");
const webConfig = require("../middlewares/web-config");

// Import Routes
// Login & Registration
const passengerSigningRoute = require("../routes/signing/passenger-signing-route");
const admin = require("../routes/admin/admin-route");
// Home Screen Section
const settingsRoute = require("../routes/home/settings-route");
const pastTripsRoute = require("../routes/home/past-trips-route");
const familyRoute = require("../routes/home/family-route");
// Payments & Complains Section
const complaintRoute = require("../routes/payment/complaints-route");
const manageFinancialsRoute = require("../routes/payment/manage-financials-route");
const loaningRoute = require("../routes/payment/loaning-route");
const paypal = require("../routes/payment/paypal-route");
// Pairing & Tracking Section
const pairing = require("../routes/pairing/pairing");
const { getAvgRate } = require("../controllers/settings");
// Externals Section
const passengerExternal = require("../routes/clients/passengerExternal-route");
// Server Interface
const serverInterfaceRoute = require("../routes/clients/serverInterface-route");
//driver
const driverSettings = require("../routes/driver/driver-settings");
const driverSigning = require("../routes/driver/driver-signing");
const drivertrips = require("../routes/driver/payment");

module.exports = function (app) {
  // Apply Essential Middlewares
  app.use(webConfig);
  app.use(express.json()); // Reparse body of the request into json object
  app.use(express.urlencoded({ extended: true })); // Reparse url to encoded url payload
  app.use(
    express.static("public", (options = { redirect: false, index: "_" }))
  ); //Serves resources from public folder
  app.use(express.static(process.cwd() + "/dist/"));

  // Apply Morgan middleware in development mode
  if (process.env.NODE_ENV == "development") {
    app.use(require("morgan")("tiny"));
  }

  // Apply Routes
  // Login & Registration
  app.use("/api/signing", passengerSigningRoute);
  // Home Screen Section
  app.use("/api/passengers/settings", authentication, settingsRoute);
  app.use("/api/passengers/family", authentication, familyRoute);
  app.use("/api/passengers/past-trips", authentication, pastTripsRoute);
  app.get("/api/passengers/get", getAvgRate);
  // Payments & Complains Section
  app.use("/api/passengers/complaints", authentication, complaintRoute);
  app.use(
    "/api/passengers/payments/manage-financials",
    authentication,
    manageFinancialsRoute
  );
  app.use("/api/passengers/payments/loaning", authentication, loaningRoute);
  app.use("/api/passengers/paypal", paypal);
  // Pairing & Tracking Section
  app.use("/api/passengers/pairing", pairing);
  // Externals Section
  //app.use("/clients/passengers", passengerExternal);
  app.use("/api/admin", admin);
  //drivers
  app.use("/api/drivers/settings", authentication, driverSettings);
  app.use("/api/drivers", driverSigning);
  app.use("/api/drivers", authentication, drivertrips);

  // Server Interface
  //app.use("/", serverInterfaceRoute)
  app.get("/*", (req, res) => {
    res.sendFile(process.cwd() + "/dist/index.html");
  });

  // Apply Error Middle ware
  app.use(error);
};
