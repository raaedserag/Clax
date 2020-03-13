const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

//****************** Stations Model ******************
// Schema
const stationSchema = new mongoose.Schema({
    name: {
        type: String, 
       
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    description: {
        type: String,
        default: null,
        maxLength: 120
    },
    type: {
        type:String, 
        required: true,
        enum:['Point', 'Polygon']
    }, 
    coordinates: {
        type: Object,
        required: true,
        
    }
});

////****************** Station Validation  ******************
// Set Validation Schema
const validationSchema = Joi.object().keys({
    name: Joi.string()
    .trim()
    .min(3)
    .max(30),
    description: Joi.string()
    .max(120),
    type: Joi.string()
    
   
});
const validateStation = function(station){
    return validationSchema.validate(station);
}

module.exports.Stations = mongoose.model("Stations", stationSchema);
module.exports.validateStation = validateStation;