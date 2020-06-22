const Joi = require("@hapi/joi");
const RegExps = require("./regExps");

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
module.exports.validateUpdateMe = function (updateReuest) {
  return udateMeSchema.validate(updateReuest);
};

// Driver Start tour Request Schema
const startTourRequestSchema = Joi.object().keys({
  direction: Joi.number().valid(0, 1).required(),
  lineId: Joi.objectId().required(),
  seats: Joi.number().integer().min(0).required(),
  loc: Joi.object().keys({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }),
});
module.exports.validateStartTourRequest = function (request) {
  return startTourRequestSchema.validate(request);
};


// End driver Tour Reqeust Schema
const endTourRequestSchema = Joi.object().keys({
  lineId: Joi.objectId().required(),
  tourId: Joi.objectId().required(),
});
module.exports.validateEndTourRequest = function (request) {
  return endTourRequestSchema.validate(request);
};
