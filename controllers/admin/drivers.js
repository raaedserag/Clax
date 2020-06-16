const { Drivers } = require("../../models/drivers-model");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

module.exports.getDrivers = async (req, res) => {
  const drivers = await Drivers.find({
    _id: { $in: req.body.driversIds },
  }).select("name");
  res.send(drivers);
};
