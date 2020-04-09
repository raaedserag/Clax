// Modules
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

// Add a Transfer Money Reqeust Schema
const addRequestSchema = Joi.object().keys({
  phone: Joi.string()
    .min(10)
    .required(),
  name: Joi.string().required(),
  amount: Joi.string()
    .required()
    .custom((amount, helpers) => {
      amount = parseFloat(amount);
      if (isNaN(amount) || amount <= 0) return helpers.error("any.invalid");
      // else
      return amount;
    }, "Amount Validation")
});
module.exports.validateAddRequest = function(transfer) {
  return addRequestSchema.validate(transfer);
};

// Cancel a Transfer Money Reqeust Schema
const cancelRequestSchema = Joi.object().keys({
  transactionId: Joi.objectId().required(),
  type: Joi.string().required()
});
module.exports.validateCancelRequest = function(transfer) {
  return cancelRequestSchema.validate(transfer);
};

// Accept a Transfer Money Reqeust Schema
const acceptRequestSchema = Joi.object().keys({
  transactionId: Joi.objectId().required(),
  loanerNamed: Joi.string().required()
});
module.exports.validateAcceptRequest = function(transfer) {
  return acceptRequestSchema.validate(transfer);
};
