const mongoose = require("mongoose");
const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

// PastTrips Model
const pastTripSchema = new mongoose.Schema({
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date, default: Date.now()
    },
    rate: {
        type: Number,
        required: true
    }, 
    _line: {type: mongoose.ObjectId, ref: 'Lines', required: true},
    _driver: {type: mongoose.ObjectId, ref: 'Drivers', required: true},
    _passengers: {type: [{type: mongoose.ObjectId, ref: 'Passengers'}], required: true}
});

// Set Validation Schema 
const validationSchema = Joi.object().keys({
    start: Joi.date()
    .required(),
    end: Joi.date(),
    rate: Joi.number()
    .required(),
    _line: Joi.objectId()
    .required(),
    _driver: Joi.objectId()
    .required(),
    _passengers: Joi.array()
    .items(Joi.objectId())
    .required()
})

const validatePastTrip =function(pastTrip){
    return validationSchema.validate(pastTrip);
  }


module.exports.PastTrips = mongoose.model("PastTrips", pastTripSchema);
module.exports.validatePastTrip = validatePastTrip;
