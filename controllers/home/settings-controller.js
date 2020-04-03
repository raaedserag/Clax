// Models
const { Passengers } = require("../../models/passengers-model");
// Helpers
const {
  encodeId,
  hashingPassword
} = require("../../helpers/encryption-helper");
const mail = require("../../services/sendgrid-mail");
const sms = require("../../services/nexmo-sms");
const { validateUpdateMe } = require("../../validators/settings-validator");
//----------------------

// Get passenger info
module.exports.getMe = async (req, res) => {
  const passenger = await Passengers.findById(req.passenger._id).select(
    "-_id name mail phone pass passLength phone_verified mail_verified"
  );
  return res.send(passenger);
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
  if (request.pass) request.pass = await hashingPassword(request.pass);

  if (request.firstName) {
    let name = {};
    name.first = request.firstName;
    name.last = request.lastName;
    delete request.lastName;
    delete request.firstName;
    request.name = name;
  }

  await Passengers.findByIdAndUpdate(req.passenger._id, request);

  return res.sendStatus(200);
};

// Request mail verification
module.exports.requestMailVerification = async (req, res) => {
  // Update mail and set to unverified
  const userUpdate = await Passengers.findByIdAndUpdate(req.passenger._id, {
    mail: req.body.mail,
    mail_verified: false
  });
  // Send mail with confirmation code & link
  const code = Number.parseInt(
    Math.random() * (999999 - 100000) + 100000
  ).toString();

  const link =
    "localhost:3000/clients/passenger/verify-mail/" + encodeId(req.passenger._id);

  await mail.sendVerificationCode(req.body.mail, {
    code,
    link,
    firstName: userUpdate.name.first
  });

  // Respond with verification code
  res.send(code.toString());
};

// Confirm mail
module.exports.confirmMail = async (req, res) => {
  await Passengers.findByIdAndUpdate(req.passenger._id, {
    mail_verified: true
  });
  return res.sendStatus(200);
};

// Request phone verification
module.exports.requestPhoneVerification = async (req, res) => {
  // Update phone and set to unverified
  const userUpdate = await Passengers.findByIdAndUpdate(req.passenger._id, {
    phone: req.body.phone,
    phone_verified: false
  });

  // Send an sms with the generated code
  const code = Number.parseInt(
    Math.random() * (999999 - 100000) + 100000
  ).toString();
  await sms.sendVerificationCode(req.body.phone, code);
  return res.send(code);
};

// Confirm phone
module.exports.confirmPhone = async (req, res) => {
  await Passengers.findByIdAndUpdate(req.passenger._id, {
    phone_verified: true
  });
  return res.sendStatus(200);
};
