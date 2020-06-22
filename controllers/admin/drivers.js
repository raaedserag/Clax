const { PastTour } = require("../../models/past-tours-model");
const Joi = require("@hapi/joi");
const _ = require("lodash");
Joi.objectId = require("joi-objectid")(Joi);

module.exports.getDrivers = async (req, res) => {
  const drivers = await PastTour.find({
    _id: { $in: req.body.driversIds },
  })
    .select("_id _driver")
    .populate({ path: "_driver", select: "_id name" });

  res.send(drivers);
};
