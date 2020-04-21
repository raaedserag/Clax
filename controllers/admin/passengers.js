const { Passengers } = require("../../models/passengers-model");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

module.exports.getPassengers = async (req, res) => {
  const users = await Passengers.find().select("name phone balance rate");
  res.send(users);
};
