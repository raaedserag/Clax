// Modules
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
//----------------------------
// Find Driver Schema
const findDriverRequest = Joi.object().keys({
  lineId: Joi.objectId().required(),
  pickupLoc: Joi.object().keys({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }),
  destLoc: Joi.object().keys({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }),
  requiredSeats: Joi.number().integer().required().min(1),
  direction: Joi.number().valid(0, 1).required()
});
module.exports.validateFindDriverRequest = function (tripinfo) {
  return findDriverRequest.validate(tripinfo);
};

//  Get driver Info schema (as a passenger)
const getDriverInfo = Joi.object().keys({
  tourId: Joi.objectId().required(),
});
module.exports.validateGetDriverInfo = function (tripinfo) {
  return getDriverInfo.validate(tripinfo);
};
