const { Passengers } = require("../../models/passengers-model");
const { Drivers } = require("../../models/drivers-model");
const { PastTrips } = require("../../models/past-trips-model");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

module.exports.getStatistics = async (req, res) => {
  let data = {
    usersActivity: {
      usersNumber: 0,
      driversNumber: 0,
      tripsNumber: 0,
    },
    capacity: 0,
  };
  const usersNumber = await Passengers.aggregate([
    {
      $group: {
        _id: {
          $month: { $toDate: "$_id" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id",
        count: 1,
      },
    },
  ]);
  const driversNumber = await Drivers.aggregate([
    {
      $group: {
        _id: {
          $month: { $toDate: "$_id" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id",
        count: 1,
      },
    },
  ]);
  const tripsNumber = await PastTrips.aggregate([
    {
      $group: {
        _id: {
          $month: { $toDate: "$_id" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id",
        count: 1,
      },
    },
  ]);
  const capacity =
    (await Drivers.find().count()) + (await Passengers.find().count());
  data.usersActivity.usersNumber = usersNumber;
  data.usersActivity.driversNumber = driversNumber;
  data.usersActivity.tripsNumber = tripsNumber;
  data.capacity = capacity;
  res.send(data);
};
