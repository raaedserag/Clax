const { PastTour } = require("../../models/past-tours-model");
const { Drivers } = require("../../models/drivers-model");
const Joi = require("@hapi/joi");
const _ = require("lodash");
Joi.objectId = require("joi-objectid")(Joi);

module.exports.getDriversNames = async (req, res) => {
  const drivers = await PastTour.find({
    _id: { $in: req.body.driversIds },
  })
    .select("_id _driver")
    .populate({ path: "_driver", select: "_id name" });

  res.send(drivers);
};

module.exports.getDrivers = async (req, res) => {
  const drivers = await Drivers.find({}).select(
    "name profilePic phone license criminalRecord govern is_verified rate balance"
  );

  res.send(drivers);
};
module.exports.getDriver = async (req, res) => {
  const schema = Joi.object().keys({
    driverId: Joi.objectId().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const drivers = await Drivers.find({ _id: req.body.driverId }).select(
    "name profilePic phone license criminalRecord govern is_verified rate balance"
  );

  res.send(drivers);
};
module.exports.deleteDriver = async (req, res) => {
  const schema = Joi.object().keys({
    driverId: Joi.objectId().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let driver = await Drivers.findOne({ _id: req.body.driverId });
  if (!driver) return res.status(404).send("driver doesn't exist!");

  await driver.remove();
  res.status(200).send("Deleted Successfully");
};
