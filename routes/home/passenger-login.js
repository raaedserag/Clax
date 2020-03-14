const {
  Passengers,
  validatePassengerLogin
} = require("../../models/passengers-model");
const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/", async (req, res) => {
  //Validate the data of user
  const { error } = validatePassengerLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Checkin if the email exists
  let passenger = await Passengers.findOne({ mail: req.body.mail });
  if (!passenger) return res.status(400).send("Email does not exist.");

  //Checkin if Password is correct
  const validPassword = await bcrypt.compare(req.body.pass, passenger.pass);
  if (!validPassword) return res.status(400).send("Invaild password.");

  //Create token, expires within 5 hours.
  const webToken = passenger.generateToken("5h");
  res.send(webToken);
});

module.exports = router;
