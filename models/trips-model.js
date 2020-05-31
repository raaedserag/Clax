const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

// CurrentTrips Model
const tripsSchema = new mongoose.Schema({
    start: { type: Date, required: true },
    end: { type: Date, default: null },
    prices: [{ type: Number, default: null, min: 0 }],
    feedbacks: [{ type: String, default: null }],
    _passengers: [{ type: mongoose.ObjectId, ref: "Passengers", required: true }],
    _car: { type: mongoose.ObjectId, ref: "Cars", required: true },
    _line: { type: mongoose.ObjectId, ref: "Lines", required: true },
    _driver: { type: mongoose.ObjectId, ref: "Drivers", required: true }
});
module.exports.Trips = mongoose.model("Trips", tripsSchema);

// Set validation Schema
const validationSchema = Joi.object().keys({
    start: Joi.date()
        .required(),
    rates: Joi.array().items(Joi.number().min(0).max(5)),
    prices: Joi.array().items(Joi.number().min(0)),
    feedbacks: Joi.array().items(Joi.string()),
    _passengers: Joi.array().items(Joi.objectId())
        .required(),
    _car: Joi.objectId()
        .required(),
    _line: Joi.objectId()
        .required(),
    _driver: Joi.objectId()
        .required(),
});
module.exports.validateTrip = function (trip) {
    return validationSchema.validate(trip);
};


