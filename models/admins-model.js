// Modules
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
const passwordComplexity = require("joi-password-complexity");
const jwt = require("jsonwebtoken");
// Includes
const { adminJwt } = require("../startup/config.js").jwtKeys();
const RegExps = require("../validators/regExps");

//****************** Admin Model ******************
// Schema
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 64,
  },
  mail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowerCase: true,
    minlength: 6,
    maxlength: 64,
    match: RegExps.mailRegExp,
  },
  pass: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 11,
    maxlength: 11,
    match: RegExps.phoneRegExp,
  },
});
// JWT generation method
adminSchema.methods.generateToken = function (expiry) {
  return jwt.sign(
    {
      _id: this._id,
      type: "admin"
    }, adminJwt, { expiresIn: expiry }
  );
};
module.exports.Admins = mongoose.model("Admins", adminSchema);
////****************** Admin Validation  ******************
// Set Password Complexity
const complexityOptions = {
  min: 8,
  max: 30,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  requirementCount: 2,
};

// Set Validation Schema
const validationSchema = Joi.object().keys({
  name: Joi.string().required().trim().min(3).max(64),
  mail: Joi.string().email().required().trim().lowercase().min(6).max(64),
  pass: passwordComplexity(complexityOptions),
  phone: Joi.string()
    .required()
    .trim()
    .min(11)
    .max(11)
    .pattern(RegExps.phoneRegExp, "Phone Number"),
});
module.exports.validateAdmin = function (admin) {
  return validationSchema.validate(admin);
};

////****************** Admin Login Validation  ******************
// Set Login Schema
const loginSchema = Joi.object().keys({
  mail: Joi.string().email().required().trim().lowercase().min(6).max(64),
  pass: Joi.string().required().min(8).max(30),
});
module.exports.validateAdminLogin = function (adminRequest) {
  return loginSchema.validate(adminRequest);
};
