// Modules
const Joi = require("@hapi/joi");
const passwordComplexity = require("joi-password-complexity");
// Schemas
const RegExps = require("./regExps");
const { complexityOptions } = require("../models/passengers-model")
////****************** Login Validation  ******************
// Set Login Schema
const loginSchema = Joi.object().keys({
    user: Joi.string().required()
        .custom((value, helpers) => {
            let result = value.match(RegExps.phoneRegExp)
            if (result && result[0] == value) return true;
            result = value.match(RegExps.mailRegExp);
            if (result && result[0] == value) return false;
            return helpers.error("any.invalid");
        }, "user Validation"),
    pass: Joi.string()
        .required()
        .min(8)
        .max(30)
});
module.exports.validateLogin = function (loginRequest) {
    return loginSchema.validate(loginRequest);
};

// Forget password schema
const forgetSchema = Joi.object().keys({
    user: Joi.string().required()
        .custom((value, helpers) => {
            let result = value.match(RegExps.phoneRegExp)
            if (result && result[0] == value) return true;
            result = value.match(RegExps.mailRegExp);
            if (result && result[0] == value) return false;
            return helpers.error("any.invalid");
        }, "user Validation")
});
module.exports.validateForgetPassword = function (forgetrequest) {
    return forgetSchema.validate(forgetrequest);
};

// New password schema
const passSchema = Joi.object().keys({
    pass: passwordComplexity(complexityOptions)
});
module.exports.validateNewPass = function (newPass) {
    return passSchema.validate(newPass);
};