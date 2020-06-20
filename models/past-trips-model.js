const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
// PastTrips Model
const pastTripsSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    rate: { type: Number, default: null, min: 0, max: 5 },
    cost: { type: Number, required: true, min: 0 },
    seats: { type: Number, required: true, min: 0 },
    feedBack: { type: String, default: null },
    _passenger: { type: mongoose.ObjectId, ref: "Passengers", required: true },
    _tour: { type: mongoose.ObjectId, ref: "PastTours", required: true },
});
module.exports.PastTrips = mongoose.model("PastTrips", pastTripsSchema);

// Set validation Schema
const validationSchema = Joi.object().keys({
    date: Joi.date().required(),
    rate: Joi.number().min(0).max(5),
    cost: Joi.number().min(0).required(),
    seats: Joi.number().min(0).required(),
    feedBack: Joi.string(),
    _passenger: Joi.objectId().required(),
});
module.exports.validatePastTrip = function (pastTrip) {
    return validationSchema.validate(pastTrip);
};
