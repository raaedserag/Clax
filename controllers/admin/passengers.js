const { Passengers } = require("../../models/passengers-model");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

module.exports.getPassengers = async (req, res) => {
  const users = await Passengers.find().select("name phone balance rate");
  res.send(users);
};
module.exports.editPassengers = async (req, res) => {
  res.send("users");
};
module.exports.getPassengerById = async (req, res) => {
  let params = { id: req.params.id };
  const schema = Joi.object().keys({
    id: Joi.objectId().required(),
  });
  const { error } = schema.validate(params);
  if (error) return res.status(400).send(error.details[0].message);
  const users = await Passengers.findOne({ _id: req.params.id })
    .populate([
      {
        path: "_pastTrips",
        select: "_id",
      },
      {
        path: "_family",
        select: "name",
      },
    ])
    .select("-pass");
  res.send(users);
};
