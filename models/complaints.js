// Modules
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
Joi.objectId = require('joi-objectid')(Joi)


//****************** Complain Model ******************
// Schema
const complaintSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        maxlength: 32 
    },
    text: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        maxlength: 500
    },
    date: {
        type: Date,
        default: Date.now
    },
    from_passenger: { 
        type: Boolean,
        default: true   // true if the complain was introduced from a passenger, false => driver
    },
    status: {
        type: String, 
        enum: ['pending', 'taken', 'resolved'], 
        default: 'pending'
        },
    _passenger: {type: mongoose.ObjectId, ref: 'Passengers'},
    _trip: {type: mongoose.ObjectId, ref: 'PastTrips'}
    // driver _id can be returned from _trip collection
});
const Complaint=mongoose.model("Complaint", complaintSchema);


////****************** Complain Validation  ******************
// Set Validation Schema 
const validationSchema = Joi.object().keys({
    title: Joi.string()
    .required()
    .trim()
    .min(4)
    .max(32),
    text: Joi.string()
    .required()
    .trim()
    .min(4)
    .max(500),
    date: Joi.date(),
    status: Joi.string()
    .valid('pending', 'taken', 'resolved'),
    _passenger: Joi.objectId(),
    _trip: Joi.objectId(),
  });

const validateComplaint =function(complaint){
    return validationSchema.validate(complaint);
};

module.exports.Complaint = Complaint;
module.exports.validateComplaint = validateComplaint;