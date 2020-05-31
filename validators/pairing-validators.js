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
  lineid: Joi.objectId().required(),
  loc: Joi.object().keys({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
  }),
  seats: Joi.number(),
});
module.exports.validateFindDriverRequest = function (tripinfo) {
  return findDriverRequest.validate(tripinfo);
};
