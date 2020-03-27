const Joi = require("@hapi/joi");
const passwordComplexity = require("joi-password-complexity");
const RegExps = require("../db/regExps");


////****************** update-me Validation  ******************
// Set Password Complexity
const complexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    requirementCount: 2
  };
  
  // Set Validation Schema
  const udateMeSchema = Joi.object().keys({
    name: Joi.object({
      first: Joi.string()
      .required()
      .trim()
      .min(3)
      .max(64),
      last: Joi.string()
      .required()
      .trim()
      .min(3)
      .max(64)
    }),
    mail: Joi.string()
      .email()
      .trim()
      .lowercase()
      .min(6)
      .max(64),
    pass: passwordComplexity(complexityOptions),
    passLength: Joi.string()
      .custom((value, helpers) => {
        value = parseFloat(value);
        if(isNaN(value) || !Number.isInteger(value) || value < 8 || value > 30) return helpers.error('any.invalid');
        // else
        return parseInt(value)
    }, 'passLength Validation'),
    phone: Joi.string()
      .trim()
      .min(11)
      .max(11)
      .pattern(RegExps.phoneRegExp, "Phone Number"),
  });
  module.exports.validateUpdateMe = function(updateReuest) {
    return udateMeSchema.validate(updateReuest);
  };