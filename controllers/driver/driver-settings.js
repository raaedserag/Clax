const bcrypt = require("bcryptjs");
const _ = require("lodash");
// Configuration & Secrets
const { host, port } = require("../../startup/config").serverConfig();
// Models & Validators
const { Drivers } = require("../../models/drivers-model");
const { Cars } = require("../../models/cars-model");
const { PastTour } = require("../../models/past-tours-model");
const {
  validateStartTourRequest,
  validateEndTourRequest,
} = require("../../validators/settings-validator");
// Services & Helpers
const { addTour, removeTour } = require("../../services/firebase");
const sms = require("../../services/nexmo-sms");
const { validateUpdateMe } = require("../../validators/settings-validator");
//----------------------------------------------------

// Get Driver info
module.exports.driverInfo = async (req, res) => {
  const driver = await Drivers.findById(req.user._id)
    .populate("_cars", "color plateNumber")
    .select("-_id name phone profilePic _cars passLength phone_verified pass");
  return res.send(driver);
};

// Update passenger info
module.exports.updateMe = async (req, res) => {
  // Validate update reuest
  const { error, value } = validateUpdateMe(req.body);
  if (error) return res.status(404).send(error.details[0].message);
  let request = value;
  // Format update request
  if (request.mail) request.mail_verified = false;
  if (request.phone) request.phone_verified = false;
  if (request.pass) request.pass = await hashing(request.pass);

  if (request.firstName) {
    let name = {};
    name.first = request.firstName;
    name.last = request.lastName;
    delete request.lastName;
    delete request.firstName;
    request.name = name;
  }

  await Drivers.findByIdAndUpdate(req.user._id, request);

  return res.sendStatus(200);
};

// Request phone verification
module.exports.requestPhoneVerification = async (req, res) => {
  // Update phone and set to unverified
  const userUpdate = await Drivers.findByIdAndUpdate(req.user._id, {
    phone: req.body.phone,
    phone_verified: false,
  });

  // Send an sms with the generated code
  const code = Number.parseInt(
    Math.random() * (999999 - 100000) + 100000
  ).toString();
  // await sms.sendVerificationCode(req.body.phone, code);
  return res.send(code);
};

// Confirm phone
module.exports.confirmPhone = async (req, res) => {
  await Drivers.findByIdAndUpdate(req.user._id, {
    phone_verified: true,
  });
  return res.sendStatus(200);
};

// Start listening to requestes
module.exports.startTour = async (req, res) => {
  // Validate Tour schema
  const { error, value } = validateStartTourRequest(req.body);
  if (error) res.status(400).send(error.details[0].message);

  // Register a new tour
  const tour = await PastTour.create({
    date: Date.now(),
    direction: value.direction,
    _line: value.lineId,
    _driver: req.user._id,
  });
  if (!tour._id) throw new Error("Can't start tour");

  // Push the tour to the driver's tours
  await Drivers.findOneAndUpdate(
    { _id: req.user._id },
    { $push: { _tours: tour._id } }
  );

  // Broadcast the tour
  await addTour(
    `${value.lineId}/${tour._id}`,
    _.pick(value, ["direction", "seats", "loc"])
  );
  // Respond with it's id
  res.send(tour._id);
};

// Stop listening to requestes
module.exports.endTour = async (req, res) => {
  // request Validation
  const { error, value } = validateEndTourRequest(req.body);
  if (error) res.status(400).send(error.details[0].message);

  // Stop tour broadcasting
  await removeTour(`${value.lineId}/${value.tourId}`);

  res.sendStatus(200);
};
