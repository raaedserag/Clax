//Modules
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
const passwordComplexity = require("joi-password-complexity");
const jwt = require("jsonwebtoken");
// Includes
const jwtDriverKey = require("../startup/config.js").jwtKeys().driverJwt;
const RegExps = require("../validators/regExps");
// Driver Model
// Schema
const driverSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 64,
    },
    last: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 64,
    },
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
  mail_verified: { type: Boolean, default: false },
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
  phone_verified: { type: Boolean, default: false },
  tripsCount: {
    type: Number,
    default: 0,
    validate: [
      {
        validator: (c) => {
          return Number.isInteger(c);
        },
        message: "tripsCount should be an integer",
      },
      {
        validator: (c) => {
          return c >= 0;
        },
        message: "tripsCount should be a positive number",
      },
    ],
  },
  rate: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
    // Calculate the rate as Average
    // set: function(r) {
    //   return (this.rate * this.tripsCount + r) / (this.tripsCount + 1);
    // },
    // get: function(r) {
    //   return Math.round(r);
    // } // Return the integer rate
  },
  img: { data: Buffer, contentType: String },
  license: {
    copy: { data: Buffer, contentType: String },
    fullName: { type: String },
    nationalId: { type: String },
    region: { type: String },
    released: { type: Date },
    expires: { type: Date },
  },
  stripeId: {
    type: String,
    default: null,
  },
  fireBaseId: {
    type: String,
    default: null,
  },
  private_trips: { type: Boolean, default: false },
  _cars: [{ type: mongoose.ObjectId, ref: "Cars" }],
  _currentCar: { type: mongoose.ObjectId, ref: "Cars" },
});
// JWT generation method
driverSchema.methods.generateToken = function (expiry = "96h") {
  return jwt.sign(
    {
      _id: this._id,
      stripeId: this.stripeId,
      is_passenger: false,
    },
    jwtDriverKey,
    { expiresIn: expiry }
  );
};

module.exports.Drivers = mongoose.model("Drivers", driverSchema);

////****************** Driver Validation  ******************
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
  name: Joi.object({
    first: Joi.string().required().trim().min(3).max(64),
    last: Joi.string().required().trim().min(3).max(64),
  }),
  mail: Joi.string().email().trim().lowercase().min(6).max(64),
  pass: passwordComplexity(complexityOptions),
  phone: Joi.string()
    .required()
    .trim()
    .min(11)
    .max(11)
    .pattern(RegExps.phoneRegExp, "Phone Number"),
  fireBaseId: Joi.string().required().trim(),
});
module.exports.validateDriver = function (driver) {
  return validationSchema.validate(driver);
};

////****************** Driver Login Validation  ******************
// Set Login Schema
const loginSchema = Joi.object().keys({
  mail: Joi.string().email().required().trim().lowercase().min(6).max(64),
  pass: Joi.string().required().min(8).max(30),
});
module.exports.validateDriverLogin = function (driverRequest) {
  return loginSchema.validate(driverRequest);
};
