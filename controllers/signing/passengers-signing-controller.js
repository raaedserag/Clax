const bcrypt = require("bcrypt");
const _ = require("lodash");
// Configuration & Secrets
const { host, port } = require("../../startup/config").serverConfig();
// Models & Validators
const {
  Passengers,
  validatePassenger,
} = require("../../models/passengers-model");
const {
  validateLogin,
  validateForgetPassword,
  validateNewPass,
} = require("../../validators/signing-validators");
// Helpers & Services
const createStripeAccount = require("../../services/stripe").createCustomer;
const {
  hashing,
  encodeId,
  generateTempToken,
} = require("../../helpers/encryption-helper");
const mail = require("../../services/sendgrid-mail");
const sms = require("../../services/nexmo-sms");
//---------------------

// Register
module.exports.passengerRegister = async (req, res) => {
  //check if the passenger information is valid.
  let { error, value } = validatePassenger(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let passenger = value;

  // check if user with the same email already registered.
  error = await Passengers.findOne({ mail: req.body.mail });
  if (error) return res.status(409).send("email already exists.");

  // check if user with the same phone number already registered.
  error = await Passengers.findOne({ phone: req.body.phone });
  if (error) return res.status(409).send("Phone number already exists.");

  // Creating Stripe account for the registered user
  const customerToken = await createStripeAccount(
    _.pick(req.body, ["firstName", "lastName", "mail", "phone"])
  );

  // Organizig passenger object
  passenger.name = { first: passenger.firstName, last: passenger.lastName };
  passenger.stripeId = customerToken.id;
  passenger.passLength = passenger.pass.length;
  passenger.pass = await hashing(passenger.pass);
  passenger = _.pick(passenger, [
    "name",
    "mail",
    "pass",
    "passLength",
    "phone",
    "stripeId",
  ]);

  //save user to the database.
  passenger = new Passengers(passenger);
  await passenger.save();

  //create web token and sends it to the user as an http header.
  const webToken = passenger.generateToken("96h");

  //pick what you want to send to the user (using lodash).
  res.header("x-login-token", webToken).sendStatus(200);
};

// Login
module.exports.passengerLogin = async (req, res) => {
  //Validate the data of user
  const { error, value } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let passenger = null;
  // value = true => user is a phone number
  if (value.user == true) {
    passenger = await Passengers.findOne({ phone: req.body.user });
    if (!passenger) return res.status(401).send("Invalid login credentials");
    if (!passenger.phone_verified)
      return res.status(401).send("This phone hasn't been activated yet");
  }
  // value = flase => user is a mail
  else {
    //Checkin if the email exists
    passenger = await Passengers.findOne({ mail: req.body.user });
    if (!passenger) return res.status(401).send("Invalid login credentials");
    if (!passenger.mail_verified)
      return res.status(401).send("This mail hasn't been activated yet");
  }

  //Checkin if Password is correct
  const validPassword = await bcrypt.compare(req.body.pass, passenger.pass);
  if (!validPassword) return res.status(401).send("Invalid login credentials");

  res.header("x-login-token", passenger.generateToken()).sendStatus(200);
};

// Forget password
module.exports.passengerForgottenPass = async (req, res) => {
  //Validate the data of user
  const { error, value } = validateForgetPassword(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let passenger = null;
  let code = Number.parseInt(
    Math.random() * (999999 - 100000) + 100000
  ).toString();
  // value = true => user is a phone number
  if (value.user == true) {
    passenger = await Passengers.findOne({ phone: req.body.user });
    if (!passenger) return res.status(401).send("Phone Number is not exist");
    if (!passenger.phone_verified)
      return res.status(401).send("This phone hasn't been activated yet");

    // Create verification code and send it to the phone
    const sendingResult = await sms.sendVerificationCode(req.body.user, code);
    if (sendingResult != true) throw new Error("Sms Sending Failed !");
  }
  // value = flase => user is a mail
  else {
    //Checkin if the email exists
    passenger = await Passengers.findOne({ mail: req.body.user });
    if (!passenger) return res.status(401).send("Mail is not exist");
    if (!passenger.mail_verified)
      return res.status(401).send("This mail hasn't been activated yet");

    // Create verification code and send it to the mail
    await mail.sendVerificationCode(req.body.user, {
      firstName: passenger.name.first,
      link: `${host}:${port}/clients/passenger/set-new-password/${encodeId(
        passenger._id
      )}`,
      code,
    });
  }

  // Respond with the verification code and give temp token as a header
  res
    .header("x-login-token", generateTempToken(passenger._id))
    .send(await hashing(code));
};

// Set new password
module.exports.passengerSetNewPass = async (req, res) => {
  //Validate the password
  const { error } = validateNewPass(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const passenger = await Passengers.findByIdAndUpdate(req.user._id, {
    pass: await hashing(req.body.pass),
  });
  res
    .header("x-login-token", new Passengers(passenger).generateToken())
    .sendStatus(200);
};
