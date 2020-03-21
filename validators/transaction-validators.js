// Modules
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

// Transfer Money Reqeust Schema
const transferRequestSchema = Joi.object().keys({
  phone: Joi.string()
    .min(10)
    .required(),

  amount: Joi.string()
    .required()
    .custom((amount, helpers) => {
      amount = parseFloat(amount);
      if (isNaN(amount) || amount <= 0) return helpers.error("any.invalid");
      // else
      return amount;
    }, "Amount Validation"),
  //Adding id shit, Muuuuuuust be removed soon
  id: Joi.objectId().required()
});
module.exports.validateTransferRequest = function(transfer) {
  return transferRequestSchema.validate(transfer);
};
// Transfer Money Schema
const transferSchema = Joi.object().keys({
  receiverId: Joi.objectId().required(),
  amount: Joi.string()
    .required()
    .custom((amount, helpers) => {
      amount = parseFloat(amount);
      if (isNaN(amount) || amount <= 0) return helpers.error("any.invalid");
      // else
      return amount;
    }, "Amount Validation"),
  //Adding id shit, Muuuuuuust be removed soon
  id: Joi.objectId().required()
});
module.exports.validateTransfer = function(transfer) {
  return transferSchema.validate(transfer);
};
