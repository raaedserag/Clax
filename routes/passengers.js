const { Passengers, validatePassenger } = require("../models/passengers-model");
const authentication = require("../middlewares/authentication");
const express = require("express");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const winston = require("winston");
const router = express.Router();

router.get("/me", authentication, async (req, res) => {
  const passenger = await Passengers.findById(req.passenger._id).select(
    "name mail phone"
  );
  res.send(passenger);
});
//register
router.post("/register", async (req, res) => {
  //check if the passenger information is valid.
  const { error } = validatePassenger(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // check if user with the same email already registered.
  let passenger = await Passengers.findOne({ mail: req.body.mail });
  if (passenger) return res.status(400).send("email already exists.");

  // check if user with the same phone number already registered.
  passenger = await Passengers.findOne({ phone: req.body.phone });
  if (passenger) return res.status(400).send("Phone number already exists.");

  //pick what you want to save in Database (using lodash).
  passenger = new Passengers(
    _.pick(req.body, ["name", "mail", "pass", "phone"])
  );

  //add salt before the hashed password, then hash it.
  const salt = await bcrypt.genSalt(10);
  passenger.pass = await bcrypt.hash(passenger.pass, salt);

  //save user to the database.
  await passenger.save();

  //create web token and sends it to the user as an http header.
  const webToken = passenger.generateToken("5h");

  //pick what you want to send to the user (using lodash).
  res.header("x-login-token", webToken).send(_.pick(passenger, ["_id"]));
});

module.exports = router;
