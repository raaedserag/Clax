const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const _ = require("lodash");
// Models
const { Passengers,
  validatePassenger,
  validatePassengerLogin } = require("../../models/passengers-model");
// Controllers and middlewares
const authentication = require("../../middlewares/authentication");
const createStripe = require('../../services/stripe').createCustomer
// Routes
const settingsRoute = require("./settings-route");
const pastTripsRoute = require("./past-trips");
const familyRoute = require("./family");
const offersRoute = require("./offers");

//---------------------

// Redirections
router.use("/settings", authentication, settingsRoute)
router.use("/offers", authentication, offersRoute);
router.use("/past-trips", authentication, pastTripsRoute);
router.use("/family", authentication, familyRoute);

//register
router.post("/register", async (req, res) => {
  //check if the passenger information is valid.
  const { error } = validatePassenger(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // check if user with the same email already registered.
  let passenger = await Passengers.findOne({ mail: req.body.mail });
  if (passenger) return res.status(409).send("email already exists.");

  // check if user with the same phone number already registered.
  passenger = await Passengers.findOne({ phone: req.body.phone });
  if (passenger) return res.status(409).send("Phone number already exists.");

  // Creating Stripe account for the registered user
  const customerToken = await createStripe(_.pick(req.body, ["name", "mail", "phone"]))
  if (!customerToken) return res.status(500).send(`Internal Server Erroe:\n ${customerToken.message}`)

  //pick what you want to save in Database (using lodash).
  passenger = new Passengers(
    _.pick(req.body, ["name", "mail", "pass", "passLength", "phone"])
  );

  //add salt before the hashed password, then hash it.
  const salt = await bcrypt.genSalt(10);
  passenger.pass = await bcrypt.hash(passenger.pass, salt);

  //save user to the database.
  await passenger.save();

  //create web token and sends it to the user as an http header.
  const webToken = passenger.generateToken("5h");

  //pick what you want to send to the user (using lodash).
  res.header("x-login-token", webToken).sendStatus(200);

});

// Login
router.post("/login", async (req, res) => {
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
