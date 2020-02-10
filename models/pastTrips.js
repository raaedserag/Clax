const mongoose = require("mongoose");

// PastTrips Model
const pastTripSchema = new mongoose.Schema({
    start: {type: Date},
    end: {type: Date, default: Date.now()},
    rate: {type: Number}, 
    _line: {type: mongoose.ObjectId, ref: 'Lines'},
    _driver: {type: mongoose.ObjectId, ref: 'Drivers'},
    _passengers: [{type: mongoose.ObjectId, ref: 'Passengers'}]
});
const PastTrips = mongoose.model("PastTrips", pastTripSchema);

module.exports.PastTrips = PastTrips;
