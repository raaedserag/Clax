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
        type: Array,
        required: true,
        set: function(c){
            if (this.type == 'Point') return c[0][0]
            else return c
        }
    }
});

////****************** Station Validation  ******************
// Set Validation Schema
const validationSchema = Joi.object().keys({
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
    coordinates: Joi.array().items(Joi.array().items(Joi.array().items(Joi.number())))
});
const validateStation = function(station){
    return validationSchema.validate(station);
}

module.exports.Stations = mongoose.model("Stations", stationSchema);
module.exports.validateStation = validateStation;