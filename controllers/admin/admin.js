const {
  Admins,
  validateAdmin,
  validateAdminLogin,
} = require("../../models/admins-model");
const Joi = require("@hapi/joi");
const _ = require("lodash");
const bcrypt = require("bcrypt");
Joi.objectId = require("joi-objectid")(Joi);

module.exports.addOffer = async (req, res) => {
  console.log("sadas");
  res.send("admin");
};
module.exports.adminLogin = async (req, res) => {
  //Validate the data of user
  const { error } = validateAdminLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Checkin if the email exists
  let admin = await Admins.findOne({ mail: req.body.mail });
  if (!admin) return res.status(400).send("Email does not exist.");

  //Checkin if Password is correct
  const validPassword = await bcrypt.compare(req.body.pass, admin.pass);
  if (!validPassword) return res.status(400).send("Invalid password.");

  //Create token, expires within some hours.
  const webToken = admin.generateToken("96h");
  res.send(webToken);
};

module.exports.adminRegister = async (req, res) => {
  //check if the passenger information is valid.
  const { error } = validateAdmin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // check if user with the same email already registered.
  let admin = await Admins.findOne({ mail: req.body.mail });
  if (admin) return res.status(409).send("email already exists.");

  // check if user with the same phone number already registered.
  admin = await Admins.findOne({ phone: req.body.phone });
  if (admin) return res.status(409).send("Phone number already exists.");

  //pick what you want to save in Database (using lodash).
  admin = new Admins(_.pick(req.body, ["name", "mail", "pass", "phone"]));

  //add salt before the hashed password, then hash it.
  const salt = await bcrypt.genSalt(10);
  admin.pass = await bcrypt.hash(admin.pass, salt);

  //save user to the database.
  await admin.save();

  //create web token and sends it to the user as an http header.
  const webToken = admin.generateToken("96h");

  //pick what you want to send to the user (using lodash).
  res.header("x-login-token", webToken).send(_.pick(admin, ["_id"]));
};

module.exports.getAdminInfo = async (req, res) => {
  const admin = await Admins.findById(req.admin._id).select("name mail phone");
  res.send(admin);
};
