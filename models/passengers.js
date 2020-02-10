const mongoose = require("mongoose");

// Passengers Model
const passengerSchema = new mongoose.Schema({
  name: {type: String},
  mail: {type: String},
  pass: {type: String},
  phone: {type: String},
  rate: {type: Number},
  balance: {type: Number},
  maxLoan: {type: Number},
  _currentTrip:{type: mongoose.ObjectId, ref: 'CurrentTrips'},
  _pastTrips: [{type: mongoose.ObjectId, ref: 'PastTrips'}],
  _complains: [{type: mongoose.ObjectId, ref: 'Complains'}]
});
const Passengers = mongoose.model("Passengers", passengerSchema);

module.exports.Passengers = Passengers;