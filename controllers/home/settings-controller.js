// Models
const { Passengers } = require("../../models/passengers-model");
const { Offers, validateOfferCode } = require("../../models/offers-model");
// Helpers
const { encodeId, hashing } = require("../../helpers/encryption-helper");
const mail = require("../../services/sendgrid-mail");
const sms = require("../../services/nexmo-sms");
const { validateUpdateMe } = require("../../validators/settings-validator");
const _ = require("lodash");
//----------------------

// Get passenger info
module.exports.getMe = async (req, res) => {
  const passenger = await Passengers.findById(req.user._id).select(
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
  if (request.mail) {
    request.mail_verified = false;
    if (await Passengers.findOne({ mail: request.mail })) return res.send("هذا الرقم مستخدم من قبل").status(499)
  }
  if (request.phone) {
    request.phone_verified = false;
    if (await Passengers.findOne({ phone: request.phone })) return res.send("هذا البريد الالكتروني مستخدم من قبل").status(499)
  }
  if (request.pass) request.pass = await hashing(request.pass);

  if (request.firstName) {
    let name = {};
    name.first = request.firstName;
    name.last = request.lastName;
    delete request.lastName;
    delete request.firstName;
    request.name = name;
  }

  await Passengers.findByIdAndUpdate(req.user._id, request);

  return res.sendStatus(200);
};

// Claim Offer
module.exports.claimOffer = async (req, res) => {
  //check if the offer code is valid.
  const { error } = validateOfferCode(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // check if code exists.
  let offer = await Offers.findOne({ code: req.body.code }).lean();
  if (!offer) return res.status(404).send("هذا العرض غير متاح حالياً.");

  //check if passenger already used the code.

  const passengerId = offer._passengers.find((x) => x == req.user._id);

  if (passengerId) return res.status(400).send("لقد استخدمت هذا العرض مسبقاً.");

  //push the passenger Id to the offer array.
  offer._passengers.push(req.user._id);
  //save offer to the database.
  await offer.save();

  // Pushing offers to the passengers offers
  await Passengers.findByIdAndUpdate(req.user._id, {
    $push: { _offers: offer._id },
  });

  //send Ok Status to user.
  res.status(200).send(offer);
};
// Get Passengers Offers
module.exports.getOffers = async (req, res) => {
  const passenger = await Passengers.findById(req.user._id)
    .select("-_id _offers")
    .populate({
      path: "_offers",
      select: "title code description end offerType value",
    });
  if (!(passenger._offers && passenger._offers.length > 0))
    return res.send("لا تمتلك اي عروض حالياً");

  return res.send(passenger._offers);
};

// Request mail verification
module.exports.requestMailVerification = async (req, res) => {
  //check if email exists.
  error = await Passengers.findOne({
    mail: req.body.mail,
    _id: { $ne: req.user._id },
  });
  if (error) return res.status(409).send("email already exists.");
  // Update mail and set to unverified
  const userUpdate = await Passengers.findByIdAndUpdate(req.user._id, {
    mail: req.body.mail,
    mail_verified: false,
  });
  // Send mail with confirmation code & link
  const code = Number.parseInt(
    Math.random() * (999999 - 100000) + 100000
  ).toString();

  const link = `https://www.clax-egyp.me/verify-mail/${encodeId(req.user._id)}`;

  http: await mail.sendVerificationCode(req.body.mail, {
    code,
    link,
    firstName: userUpdate.name.first,
  });

  // Respond with verification code
  res.send(link);
};

// Confirm mail
module.exports.confirmMail = async (req, res) => {
  await Passengers.findByIdAndUpdate(req.user._id, {
    mail_verified: true,
  });
  return res.sendStatus(200);
};

// Request phone verification
module.exports.requestPhoneVerification = async (req, res) => {
  // Update phone and set to unverified
  const userUpdate = await Passengers.findByIdAndUpdate(req.user._id, {
    phone: req.body.phone,
    phone_verified: false,
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
  await Passengers.findByIdAndUpdate(req.user._id, {
    phone_verified: true,
  });
  return res.sendStatus(200);
};
