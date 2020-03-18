const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

//****************** Stations Model ******************
// Schema
const stationSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
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
        type: Array,
        required: true,
    }
});
module.exports.Stations = mongoose.model("Stations", stationSchema);

////****************** Station Validation  ******************
// Set one station Validation Schema
const validateStationSchema = Joi.object().keys({
    name: Joi.string()
    .required()
    .trim()
    .min(3)
    .max(30),
    description: Joi.string()
    .max(120),
    type: Joi.string()
    .required()
    .valid('Point', 'Polygon'),
    coordinates: Joi.array().items(Joi.number())
});
module.exports.validateStation = function(station){
    return validateStationSchema.validate(station);
}

// Set Array of Stations Validation Schema
const validateStationsSchema = Joi.array().items({
    name: Joi.string()
    .required()
    .trim()
    .min(3)
    .max(50),
    description: Joi.string()
    .max(120),
    type: Joi.string()
    .required()
    .valid('Point', 'Polygon'),
    coordinates: Joi.array().items(Joi.number())
});
module.exports.validateStations = function(stations){
    return validateStationsSchema.validate(stations);
}


