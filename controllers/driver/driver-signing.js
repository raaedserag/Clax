const bcrypt = require("bcrypt");
const _ = require("lodash");
const fs = require("fs");
// Configuration & Secrets
const { host, port } = require("../../startup/config").serverConfig();
// Models & Validators
const {
  Drivers,
  validateDriver,
  validateDriverLogin,
} = require("../../models/drivers-model");

// Helpers & Services
const { subscribeToTopic } = require("../../services/firebase");
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
module.exports.driverRegister = async (req, res) => {
  //check if the passenger information is valid.
  let { error, value } = validateDriver(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let driver = value;

  // check if user with the same email already registered.
  //   error = await Driver.findOne({ mail: req.body.mail });
  //   if (error) return res.status(409).send("email already exists.");

  // check if user with the same phone number already registered.
  error = await Drivers.findOne({ phone: req.body.phone });
  if (error) return res.status(409).send("Phone number already exists.");

  // Organizig passenger object

  driver.passLength = driver.pass.length;
  driver.pass = await hashing(driver.pass);

  driver = _.pick(driver, [
    "name",
    "pass",
    "passLength",
    "phone",
    "stripeId",
    "fireBaseId",
    "profilePic",
    "govern",
  ]);

  //save user to the database.
  driver = new Drivers(driver);
  //driver.profilePic.data = fs.readFileSync("driver.jpg");
  driver.profilePic.contentType = "image/png";

  await driver.save();

  //create web token and sends it to the user as an http header.
  const webToken = driver.generateToken("96h");

  // Subscribe registered passenger to passengers topic
  await subscribeToTopic(driver.fireBaseId, "drivers");
  //pick what you want to send to the user (using lodash).
  res.header("x-login-token", webToken).sendStatus(200);
};

// Login
module.exports.driverLogin = async (req, res) => {
  //Validate the data of user
  const { error, value } = validateDriverLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let driver = await Drivers.findOne({ phone: req.body.user });
  if (!driver) return res.status(401).send("Invalid login credentials");
  if (!driver.phone_verified)
    return res.status(401).send("This phone hasn't been activated yet");

  // value = flase => user is a mail
  //   else {
  //     //Checkin if the email exists
  //     driver = await Drivers.findOne({ mail: req.body.user });
  //     if (!passenger) return res.status(401).send("Invalid login credentials");
  //     //if (!passenger.mail_verified) return res.status(401).send("This mail hasn't been activated yet")
  //   }

  //Checkin if Password is correct
  const validPassword = await bcrypt.compare(req.body.pass, driver.pass);
  if (!validPassword) return res.status(401).send("Invalid login credentials");

  // Change fireBaseId and respond with header token
  await Drivers.findByIdAndUpdate(driver._id, {
    fireBaseId: req.body.fireBaseId,
  });
  res.header("x-login-token", driver.generateToken()).sendStatus(200);
};

// Forget password
module.exports.driverForgottenPass = async (req, res) => {
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
module.exports.driverSetNewPass = async (req, res) => {
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
