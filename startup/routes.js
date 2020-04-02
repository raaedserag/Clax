// Import Modules
const express = require("express");
const morgan = require("morgan");

// Import Middlewares
const error = require("../middlewares/error");
// Import Routes
const complaintRoute = require("../routes/payment/complaints");
const offers = require("../routes/home/offers");
const passengers = require("../routes/home/passengers");
const transaction = require("../routes/payment/transactions");
const payment = require("../routes/payment/payment");
const pastTrips = require("../routes/home/past-trips");
const family = require("../routes/home/family");
const pairing = require("../routes/pairing/pairing");
const admin = require("../routes/home/admin");

module.exports = function(app) {
  // Apply Essential Middlewares
  app.use(express.json()); // Reparse body of the request into json object
  app.use(express.urlencoded({ extended: true })); // Reparse url to encoded url payload
  //app.use(express.static("public")); // For static files if needed
  app.use(function(req, res, next) {
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
