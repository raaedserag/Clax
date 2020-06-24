const { Passengers } = require("../../models/passengers-model");
const { Drivers } = require("../../models/drivers-model");
const { PastTrips } = require("../../models/past-trips-model");
const { Log } = require("../../models/Log-model");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

module.exports.getStatistics = async (req, res) => {
  let governs = {
    Alexandria: "الإسكندرية",
    Cairo: "القاهرة",
    Aswan: "أسوان",
    Elbehera: "البحيرة",
    Asyut: "أسيوط",
    ElGhrabia: "الغربية",
    Isamilia: "الإسماعيلية",
    Luxor: "الأقصر",
    BaniSuef: "بني سويف",
    PortSaid: "بورسعيد",
    SouthSinai: "جنوب سيناء",
    Giza: "الجيزة",
    ElDaqaulia: "الدقهلية",
    Dumyat: "دمياط",
    Sohag: "سوهاج",
    Suez: "السويس",
    ElSharqia: "الشرقية",
    KafElsheikh: "كفر الشيخ",
  };
  let data = {
    usersActivity: {
      usersNumber: 0,
      driversNumber: 0,
      tripsNumber: 0,
    },
    revenue: 0,
    capacity: 0,
    errorsNumber: 0,
    updatesNumber: 0,
    usersGoverns: 0,
  };
  data.usersGoverns = await Passengers.aggregate([
    {
      $group: {
        _id: "$govern",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        govern: "$_id",
        count: 1,
      },
    },
  ]);
  function getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value);
  }
  data.usersGoverns.forEach((element) => {
    element.govern = getKeyByValue(governs, element.govern);
  });
  data.usersActivity.usersNumber = await Passengers.aggregate([
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
  data.usersActivity.driversNumber = await Drivers.aggregate([
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
  data.usersActivity.tripsNumber = await PastTrips.aggregate([
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
  data.capacity =
    (await Drivers.find().countDocuments()) +
    (await Passengers.find().countDocuments());
  data.errorsNumber = await Log.find({ level: "error" }).countDocuments();
  data.updatesNumber = await Log.find({
    level: "info",
    message: "Connected to atlas DB successfully",
  }).countDocuments();

  data.revenue = await PastTrips.aggregate([
    {
      $group: {
        _id: {
          $month: { $toDate: "$_id" },
        },
        revenue: { $sum: "$cost" },
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id",
        revenue: 1,
      },
    },
  ]);

  res.send(data);
};
