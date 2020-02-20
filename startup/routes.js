// Modules
const express = require("express");
const morgan = require("morgan");
const offers = require("../routes/offers");
const passengers = require("../routes/passengers");
const passengerLogin = require("../routes/passenger-login");
// Middlewares
const error = require("../middlewares/error");

// Routes
//----
module.exports = function(app) {
  // Apply Middlewares
  app.use(express.json()); // Reparse body of the request into json object
  app.use(express.urlencoded({ extended: true })); // Reparse url to encoded url payload
  //app.use(express.static("public")); // For static files if needed
  // in development mode only
  if (app.get("env") === "development") {
    app.use(morgan("tiny"));
  }
  app.use("/api/offers", offers);
  app.use("/api/passengers", passengers);
  app.use("/api/login", passengerLogin);
  app.use(error);
};
