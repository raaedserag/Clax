//Models
const { Drivers } = require("../models/drivers-model");
const { Complaints } = require("../models/complaints-model");

// Helpers
const _ = require("lodash")
// Get feedback info
module.exports.getFeedback = async (req, res) => {
  const feedback = await Drivers.find({ phone: "01258963485" }).select(
    "-_id name mail "
  );
  return res.send(feedback);
};

// Get avarege rate
module.exports.getAvgRate = async (req, res) => {
  let rate = await Drivers.findById("5ee260f31e23a73cd8196986")
    .select("-_id _tours")
    .populate({
      path: "_tours",
      select: "-_id _trips",
      populate: {
        path: "_trips",
        select: "-_id rate"
      }
    });
  rate = _.map(rate._tours, _.partialRight(_.pick, ["_trips"]))
  //rate = JSON.parse(JSON.stringify(rate));
  function averageRate(list) {
    let sum = 0;
    let rateCount = 0;
    for (let i = 0; i < list.length; i++) {
      if (list[i].rate)
        sum += list[i].rate;

      rateCount++;
    }
    if (rateCount == 0) {
      return 0;
    }
    let avg = sum / rateCount;
    return avg;
  }
  let avg = averageRate(rate);

  return res.send(avg.toString());
};
// const data = await Drivers.findById('5e79060196679e21b8304309').select(
//   "-_id rate status.is_available img tripsCount"
// );

// let info = {
//   avg : avg.toString(),
//   data : data
// }
// return res.send(info);
