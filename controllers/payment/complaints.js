const {
  Complains,
  validateComplaint
} = require("../../models/complains-model");
const { PastTrips } = require("../../models/past-trips-model");
const { Passengers } = require("../../models/passengers-model");
const { Lines } = require("../../models/lines-model");
const { Drivers } = require("../../models/drivers-model");

let complaintsPost = async (req, res) => {
  let complaint = {
    _passenger: req.passenger._id,
    _trip: req.body._trip,
    text: req.body.text,
    from_passenger: req.body.from_passenger,
    code: Date.now(),
    date: Date.now()
  };

  const { error } = validateComplaint(complaint);
  if (error) return res.status(400).send(error.details[0].message);
  complaint = new Complains(complaint);
  complaint = await complaint.save();
  const updatingResult = await Passengers.findByIdAndUpdate(req.passenger._id, {
    $push: { _complains: complaint._id }
  })
    .select("-_id _complains")
    .populate({
      path: "_complains",
      select: "-_id response text date status code _trip"
    });
  if (updatingResult.n == 0) return res.send("User Not Found").status(404);
  res.send(complaint);
};

let complaintsGet = async (req, res) => {
  var complaints = await Passengers.findById(req.passenger._id)
    .select("-_id _complains")
    .populate({
      path: "_complains",
      select: "-_id response text date status code _trip"
    });
  res.send(complaints["_complains"]);
};

let tripGet = async (req, res) => {
  const result = await Passengers.findById(req.passenger._id)
    .select("-_id _pastTrips")
    .populate({
      path: "_pastTrips",
      select: "_id _driver start price",
      populate: [
        { path: "_line", select: "-_id from to" },
        { path: "_driver", select: "-_id name img" }
      ]
    });
  /*.populate({
  path: '_pastTrips', 
  select: '_id', 
  populate: {path: '_driver', select: 'name _id'}})
*/
  res.send(result);
};

module.exports.complaintsPost = complaintsPost;
module.exports.complaintsGet = complaintsGet;
module.exports.tripGet = tripGet;
