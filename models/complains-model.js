// Modules
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

//****************** Complain Model ******************
// Schema
const complaintSchema = new mongoose.Schema({
  response: {
    type: String,
    default: null,
    trim: true,
  },
  code: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    maxlength: 500,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  from_passenger: {
    type: Boolean,
    default: true, // true if the complain was introduced from a passenger, false => driver
  },
  status: {
    type: String,
    enum: ["pending", "taken", "resolved"],
    default: "pending",
  },
  _passenger: { type: mongoose.ObjectId, ref: "Passengers" },
  _trip: { type: mongoose.ObjectId, ref: "PastTrips" },
  // driver _id can be returned from _trip collection
});
module.exports.Complaints = mongoose.model("Complaints", complaintSchema);

////****************** Complain Validation  ******************
// Set Validation Schema
const validationSchema = Joi.object().keys({
  response: Joi.string().trim(),
  code: Joi.number(),
  text: Joi.string().required().trim().min(4).max(500),
  date: Joi.date().required(),
  from_passenger: Joi.bool(),
  status: Joi.string().valid("pending", "taken", "resolved"),
  _passenger: Joi.objectId(),
  _trip: Joi.objectId(),
});

const validateComplaint = function (complaint) {
  return validationSchema.validate(complaint);
};

module.exports.validateComplaint = validateComplaint;
