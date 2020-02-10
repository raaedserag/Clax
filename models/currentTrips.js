const mongoose = require("mongoose");

// CurrentTrips Model
const currentTripSchema = new mongoose.Schema({
    start: {type: Date},
    _line: {type: mongoose.ObjectId, ref: 'Lines'},
    _driver: {type: mongoose.ObjectId, ref: 'Drivers'},
    _passengers: {type: mongoose.ObjectId, ref: 'Passengers'},
});
const CurrentTrips = mongoose.model("CurrentTrips", currentTripSchema);

module.exports.CurrentTrips = CurrentTrips;
