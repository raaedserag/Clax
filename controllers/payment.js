// Modules 
const Joi = require("@hapi/joi");
// Models
const Passengers = require("../models/passengers-model").Passengers
// Setup Error Debugger
const errorDebugger = require("debug")("app:error");

// Functions
// Retreive use balance
module.exports.getUserBalance = async function(userId){
    try {
        const user = await Passengers.findById(userId)
        .select('-_id balance')
        return {success: true, result: user}
    } 
    catch (error) {
        errorDebugger(error.message)
        return {success: false, result: error.message}
    }
}

module.exports.getUserStripeId = async function(userId){
    try {
        const user = await Passengers.findById(userId)
        .select('-_id stripeId')
        return {success: true, result: user}
    } 
    catch (error) {
        errorDebugger(error.message)
        return {success: false, result: error.message}
    }
}

// Validators
// Card Schema Validator
const cardSchema =  Joi.object().keys({
    number: Joi.string()
    .required(),
    exp_month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .required(),
    exp_year: Joi.number()
    .integer()
    .required(),
    cvc: Joi.number()
    .integer()
    .required()
    //Adding id shit, Muuuuuuust be removed soon
    ,id: Joi.string().required()
});
module.exports.validateCard = function(card){
    return cardSchema.validate(card);
};

// Charge Balance Schema
const chargeSchema = Joi.object().keys({
    amount: Joi.number()
    .integer()
    .min(1)
    .required(),
    source: Joi.string()
    .required()
    //Adding id shit, Muuuuuuust be removed soon
    ,id: Joi.string().required()
});
module.exports.validateCharge = function(charge){
    return chargeSchema.validate(charge);
};