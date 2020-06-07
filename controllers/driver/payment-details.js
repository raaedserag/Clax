const { Drivers } = require("../../models/drivers-model");
const { PastTrips } = require("../../models/past-trips-model");

module.exports.getPaymentInfo = async (req, res) => {
  let result;
  result.balance = await Drivers.findById(req.user._id).select("balance");
  result.weekStatistics = await PastTrips.aggregate([
    {
      $match: {
        _driver: req.user._id,
        timestamp: {
          $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000),
        },
      },
    },
    {
      $group: {
        totalAmount: { $sum: "$balance" },
        count: { $sum: 1 },
      },
    },
  ]);

  res.send(result);
};
