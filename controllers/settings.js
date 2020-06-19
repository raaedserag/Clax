//Models
const { Drivers } = require("../models/drivers-model");
const { Complaints } = require("../models/complaints-model");
const { PastTrips } = require("../models/past-trips-model");

// Helpers

// Get feedback info
module.exports.getFeedback = async (req, res) => {
  const feedback = await Drivers.find({ phone: "01258963485" }).select(
    "-_id name mail "
  );
  return res.send(feedback);
};

// Get avarege rate
module.exports.getAvgRate = async (req, res) => {
  let rate = await PastTrips.find({
    _driver: "5e79060196679e21b8304309",
  }).select("-_id rate");
  //rate = JSON.parse(JSON.stringify(rate));
  console.log(rate);
  function averageRate(list) {
    let sum = 0;
    let rateCount = 0;
    for (let i = 0; i < list.length; i++) {
      sum += list[i].rate;
      console.log(sum);
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
