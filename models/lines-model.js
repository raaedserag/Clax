const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

// Lines Model
const lineSchema = new mongoose.Schema({
    from: {
        type: String,
        trim: true,
        required: true,
        minlength: 3,
        maxlength: 30
    },
    to: {
        type: String,
        trim: true,
        required: true,
        minlength: 3,
        maxlength: 30
    },
    direction: { type: Boolean, default: true },
    cost: { type: Number, required: true },
    _stations: [{ type: mongoose.ObjectId, ref: 'Stations' }]
});
module.exports.Lines = mongoose.model("Lines", lineSchema);

// Lines Validations
const validationSchema = Joi.object().keys({
    from: Joi.string()
        .trim()
        .required()
        .min(3)
        .max(30),
    to: Joi.string()
        .trim()
        .required()
        .min(3)
        .max(30),
    direction: Joi.bool(),
    cost: Joi.string()
        .required()
        .custom((amount, helpers) => {
            amount = parseFloat(amount);
            if (isNaN(amount) || amount <= 0) return helpers.error('any.invalid');
            // else
            return amount
        }, 'Amount Validation'),
    _stations: Joi.array().items(Joi.objectId())
})
module.exports.validateLine = function (line) {
    return validationSchema.validate(line)
}