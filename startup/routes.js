// Modules
const express = require("express");
const morgan = require("morgan");

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
  if(app.get('env') === 'development')
  {
    console.log("test")
    app.use(morgan("tiny"));
  }
  
  // Apply Routers
  //----
};
