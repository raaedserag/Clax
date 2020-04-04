const Joi = require("@hapi/joi");
const RegExps = require("./regExps")
////****************** Login Validation  ******************
// Set Login Schema
const loginSchema = Joi.object().keys({
    user: Joi.string().required()
        .custom((value, helpers) => {
            // If the user is a valid phone number returns true
            let validation = value.match(RegExps.phoneRegExp)
            if (validation && validation[0] == value) return true;
            // If the user is a valid mail returns false
            else {
                validation = value.match(RegExps.mailRegExp);
                if (validation && validation[0] == value) return false;
                // Else, throw an error
                else return helpers.error("any.invalid");
            }
        }, "User Validation"),
    pass: Joi.string()
        .required()
        .min(8)
        .max(30)
});
module.exports.validateLogin = function (loginRequest) {
    return loginSchema.validate(loginRequest);
};