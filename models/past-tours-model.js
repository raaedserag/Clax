const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
// Past Tours Model
const pastTourSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  direction: { type: Number, enum: [0, 1], required: true },
  _line: { type: mongoose.ObjectId, ref: "Lines", required: true },
  _trips: [{ type: mongoose.ObjectId, ref: "PastTrips" }],
  _driver: { type: mongoose.ObjectId, ref: "Drivers", required: true },
});
module.exports.PastTour = mongoose.model("PastTours", pastTourSchema);

// Set validation Schema
const validationSchema = Joi.object().keys({
  date: Joi.date().required(),
  direction: Joi.number().valid(0, 1).required(),
  _line: Joi.objectId().required(),
  _trips: Joi.array().items(Joi.objectId()),
  _driver: Joi.objectId().required(),
});
module.exports.validatePastTours = function (pastTour) {
  return validationSchema.validate(pastTour);
};
