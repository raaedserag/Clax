// Modules
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
Joi.objectId = require('joi-objectid')(Joi)


//****************** Complain Model ******************
// Schema
const complainSchema = new mongoose.Schema({
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
        default: true
    },
    status: {
        type: String, 
        enum: ['pending', 'taken', 'resolved'], 
        default: 'pending'
        },
    _trip: {type: mongoose.ObjectId, ref: 'PastTrips'}
    
    
});


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
    status: Joi.string(),
    //.enum(['pending', 'taken', 'resolved']),
    _trip: Joi.objectId(),
  });

const validateComplain =function(complain){
    return validationSchema.validate(complain);
};
  
module.exports.Complains = mongoose.model("Complains", complainSchema);
module.exports.validateComplain = validateComplain;