const mongoose = require("mongoose");

// Station Model
const stationSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        lowercase: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },

    location: {
        type: {type:String, required: true}, 
        coordinates: [{type: Number, required: true}]
    }
});
const Stations = mongoose.model("Stations", stationSchema);

module.exports.Stations = Stations;