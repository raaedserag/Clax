const RegExps = require("./regExps")
////****************** Login Validation  ******************
// Set Login Schema
const loginSchema = Joi.object().keys({
    phone: Joi.string()
        .trim()
        .min(11)
        .max(11)
        .pattern(RegExps.phoneRegExp, "Phone Number"),
    mail: Joi.string()
        .email()
        .trim()
        .lowercase()
        .min(6)
        .max(64),
    pass: Joi.string()
        .required()
        .min(8)
        .max(30)
});
module.exports.validateLogin = function (loginRequest) {
    return loginSchema.validate(loginRequest);
};