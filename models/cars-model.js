const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
// Car Model
const carSchema = new mongoose.Schema({
    // Hex color
    color: {
        type: String,
        default: null,
        minlength: 10,
        maxlength: 10
    },
    plateNumber: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 10
    },    // Car Number (Common usage to identify car)
    license: {
        copy: { data: Buffer, contentType: String },
        ownerName: { type: String },
        vin: { type: String },            // Vehicle Identification Number (Only for security)
        released: { type: Date },
        checking: { type: Date },
        expires: { type: Date }
    },
    _line: { type: mongoose.ObjectId, ref: 'Lines', required: true }
});

module.exports.Cars = mongoose.model("Cars", carSchema);

// Set Validation Schema
const validationSchema = Joi.object().keys({
    color: Joi.string()
        .min(7)
        .max(7),
    plateNumber: Joi.string()
        .required()
        .trim()
        .min(3),
    _line: Joi.objectId()
        .required(),
});
module.exports.validateCar = function (car) {
    return validationSchema.validate(car);
};
