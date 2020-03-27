// Modules
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
const passwordComplexity = require("joi-password-complexity");
const jwt = require("jsonwebtoken");
// Includes
const jwtPassengerKey = require("../startup/config.js").jwtKeys().passengerJwt;
const RegExps = require("../db/regExps");

//****************** Passenger Model ******************
// Schema
const passengerSchema = new mongoose.Schema({
  name: {
    first: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 64
    },
    last: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 64
    } 
  },
  mail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowerCase: true,
    minlength: 6,
    maxlength: 64,
    match: RegExps.mailRegExp
  },
  mail_verified: { type: Boolean, default: false },
  pass: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024
  },
  passLength: {
    type: Number,
    required: true,
    min: 8,
    max: 30
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 11,
    maxlength: 11,
    match: RegExps.phoneRegExp
  },
  phone_verified: { type: Boolean, default: false },
  tripsCount: {
    type: Number,
    default: 0,
    validate: [
      {
        validator: c => {
          return Number.isInteger(c);
        },
        message: "tripsCount should be an integer"
      },
      {
        validator: c => {
          return c >= 0;
        },
        message: "tripsCount should be a positive number"
      }
    ]
  },
  rate: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
    // Calculate the rate as Average
    // set: function(r) {
    //   return (this.rate * this.tripsCount + r) / (this.tripsCount + 1);
    // },
    // get: function(r) {
    //   return Math.round(r);
    // } // Return the integer rate
  },
  balance: {
    type: Number,
    default: 0,
    validate: {
      validator: function(b) {
        return b >= this.balance - this.maxLoan;
      },
      message: "balance can't be less than maxLoan value"
    }
  },
  loanedAmount: {
    type: Number,
    default: 0,
    validate: [
      {
        validator: function(l) {
          return l >= 0;
        },
        message: "loanedAmount should be a positive value"
      },
      {
        validator: function(l) {
          return l <= this.maxLoan;
        },
        message: "loanedAmount must be less than or equal maxLoan"
      }
    ]
  },
  maxLoan: {
    type: Number,
    default: 0,
    validate: {
      validator: function(m) {
        return m >= 0;
      },
      message: "maxLoan should be a positive value"
    }
  },
  stripeId: {
    type: String, 
    default: null
  },
  _currentTrip: { type: mongoose.ObjectId, ref: "CurrentTrips"},
  _pastTrips: [{ type: mongoose.ObjectId, ref: "PastTrips"}],
  _offers: [{ type: mongoose.ObjectId, ref: "Offers" }],
  _complains: [{ type: mongoose.ObjectId, ref: "Complains" }],
  _family: [{type: mongoose.ObjectId, ref: "Passengers"}],
  _familyRequests: [{type: mongoose.ObjectId, ref: "Passengers"}]
});

// JWT generation method
passengerSchema.methods.generateToken = function(expiry) {
  return jwt.sign({
     _id: this._id,
     stripeId: this.stripeId,
     is_passenger: true 
    }, jwtPassengerKey, { expiresIn: expiry });
};

////****************** Passenger Validation  ******************
// Set Password Complexity
const complexityOptions = {
  min: 8,
  max: 30,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  requirementCount: 2
};

// Set Validation Schema
const validationSchema = Joi.object().keys({
  name: Joi.object({
    first: Joi.string()
    .required()
    .trim()
    .min(3)
    .max(64),
    last: Joi.string()
    .required()
    .trim()
    .min(3)
    .max(64)
  }),
  mail: Joi.string()
    .email()
    .required()
    .trim()
    .lowercase()
    .min(6)
    .max(64),
  pass: passwordComplexity(complexityOptions),
  passLength: Joi.string()
    .required()
    .custom((value, helpers) => {
      value = parseFloat(value);
      if(isNaN(value) || !Number.isInteger(value) || value < 8 || value > 30) return helpers.error('any.invalid');
      // else
      return value
  }, 'passLength Validation'),
  phone: Joi.string()
    .required()
    .trim()
    .min(11)
    .max(11)
    .pattern(RegExps.phoneRegExp, "Phone Number"),
  tripsCount: Joi.number()
    .integer()
    .min(0),
  rate: Joi.number()
    .min(0)
    .max(5),
  balance: Joi.number(),
  loanedAmount: Joi.number().min(0),
  maxLoan: Joi.number().min(0),
  stripeId: Joi.string(),
  _currentTrip: Joi.objectId(),
  _pastTrips: Joi.array().items(Joi.objectId()),
  _offers: Joi.array().items(Joi.objectId()),
  _complains: Joi.array().items(Joi.objectId()),
  _family: Joi.array().items(Joi.objectId()),
  _familyRequests: Joi.array().items(Joi.objectId())
});
const validatePassenger = function(passenger) {
  return validationSchema.validate(passenger);
};

////****************** Passenger Login Validation  ******************
// Set Login Schema
const loginSchema = Joi.object().keys({
  mail: Joi.string()
    .email()
    .required()
    .trim()
    .lowercase()
    .min(6)
    .max(64),
  pass: Joi.string()
    .required()
    .min(8)
    .max(30)
});
const validatePassengerLogin = function(passengerRequest) {
  return loginSchema.validate(passengerRequest);
};

module.exports.Passengers = mongoose.model("Passengers", passengerSchema);
module.exports.validatePassenger = validatePassenger;
module.exports.validatePassengerLogin = validatePassengerLogin;
