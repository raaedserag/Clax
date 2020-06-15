// Modules
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
//----------------------------

// Finish Trip Schema
const finishTripRequest = Joi.object().keys({
  driverId: Joi.objectId().required(),
  trip: Joi.object().keys({
    price: Joi.number().required(),
    location: Joi.string().required(),
    rate: Joi.number(),
    description: Joi.string(),
  }),
});
module.exports.validateFinishTripRequest = function (tripinfo) {
  return finishTripRequest.validate(tripinfo);
};

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
  driverId: Joi.objectId().required(),
});
module.exports.validateGetDriverInfo = function (tripinfo) {
  return getDriverInfo.validate(tripinfo);
};
