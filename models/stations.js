const mongoose = require("mongoose");

// Station Model
const stationSchema = new mongoose.Schema({
    name: {type: String},
    location: {type: {type:String}, coordinates: [{type: Number}]}
});
const Stations = mongoose.model("Stations", stationSchema);

module.exports.Stations = Stations;