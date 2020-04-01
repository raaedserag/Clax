// Modules
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
//----------------------------

// Card Schema
const cardSchema = Joi.object().keys({
  number: Joi.string().required(),
  exp_month: Joi.string()
    .required()
    .custom((value, helpers) => {
      value = parseFloat(value);
      if (isNaN(value) || !Number.isInteger(value) || value < 1 || value > 12)
        return helpers.error("any.invalid");
      // else
      return value;
    }, "month Validation"),
  exp_year: Joi.string()
    .required()
    .custom((value, helpers) => {
      value = parseFloat(value);
      if (isNaN(value) || !Number.isInteger(value) || value < 2000)
        return helpers.error("any.invalid");
      // else
      return value;
    }, "year Validation"),
  cvc: Joi.number()
    .required()
    .custom((value, helpers) => {
      value = parseFloat(value);
      if (
        isNaN(value) ||
        !Number.isInteger(value) ||
        value < 100 ||
        value > 9999
      )
        return helpers.error("any.invalid");
      // else
      return value;
    }, "cvc Validation")
});
module.exports.validateCard = function (card) {
  return cardSchema.validate(card);
};

// Charge Balance Schema
const chargeSchema = Joi.object().keys({
  amount: Joi.string()
    .required()
    .custom((amount, helpers) => {
      amount = parseFloat(amount);
      if (isNaN(amount) || amount <= 0) return helpers.error("any.invalid");
      // else
      return amount;
    }, "Amount Validation"),
  source: Joi.string().required()
});
module.exports.validateCharge = function (charge) {
  return chargeSchema.validate(charge);
};
