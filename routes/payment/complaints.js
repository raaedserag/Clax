// Modules
const express = require("express");
const router = require("express").Router();
//Middlewares
const authrization=require("../../middlewares/authentication");
// Controllers
const {
  complaintsPost,
  complaintsGet,
  tripGet
} = require("../../controllers/payment/complaints");

//making a complaint
router.post("/complaint",authrization, complaintsPost);

//Get user complaint
router.get("/mycomplaint",authrization, complaintsGet);

//Get user trips
router.get("/",authrization, tripGet);

module.exports = router;
