const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
  name: {type: String},
  mail: {type: String},
  pass: {type: String},
  phone: {type: String},
  rate: {type: Number},
  balance: {type: Number},
  maxLoan: {type: Number},
  _currentTrip:{type: mongoose.ObjectId},
  _pastTrip: {type: mongoose.ObjectId}

});
// generate web token and set an expiry date.
passengerSchema.methods.generateToken = function(expiry) {
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey"),
    { expiresIn: expiry }
  );
};

const Passenger = mongoose.model("Passenger", passengerSchema);

function validatePassenger(passenger) {
  //validate Password
  const complexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    requirementCount: 2
  };

  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: new PasswordComplexity(complexityOptions).required()
  };
  return Joi.validate(passenger, schema);
}

function validatePassengerLogin(passengerRequest) {
  const schema = {
    email: Joi.string().required(),
    password: Joi.string().required()
  };
  return Joi.validate(passengerRequest, schema);
}

module.exports.Passenger = Passenger;
module.exports.validatePassenger = validatePassenger;
module.exports.validatePassengerLogin = validatePassengerLogin;
