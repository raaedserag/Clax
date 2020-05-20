// Modules
const express = require("express");
const router = require("express").Router();
// Controllers
const {
  complaintsPost,
  complaintsGet,
  tripGet,
} = require("../../controllers/payment/complaints-controller");

// Create a complaint
router.post("/add", complaintsPost);

// Get all passenger complaints
router.get("/all", complaintsGet);

// Get user trips
router.get("/get-trips", tripGet);

module.exports = router;
