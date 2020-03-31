const Joi = require("@hapi/joi");
const RegExps = require("../db/regExps");

////****************** update-me Validation  ******************
// Set Validation Schema
const udateMeSchema = Joi.object().keys({
  firstName: Joi.string()
    .trim()
    .min(3)
    .max(64),
  lastName: Joi.string()
    .trim()
    .min(3)
    .max(64),
  mail: Joi.string()
    .email()
    .trim()
    .lowercase()
    .min(6)
    .max(64),
  pass: Joi.string(),
  passLength: Joi.string().custom((value, helpers) => {
    value = parseFloat(value);
    if (isNaN(value) || !Number.isInteger(value) || value < 8 || value > 30)
      return helpers.error("any.invalid");
    // else
    return parseInt(value);
  }, "passLength Validation"),
  phone: Joi.string()
    .trim()
    .min(11)
    .max(11)
    .pattern(RegExps.phoneRegExp, "Phone Number")
});
module.exports.validateUpdateMe = function(updateReuest) {
  return udateMeSchema.validate(updateReuest);
};
