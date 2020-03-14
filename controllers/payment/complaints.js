const { Complains, validateComplaint } = require("../../models/complains-model");
const { PastTrips } = require("../../models/past-trips-model");
const { Passengers } = require("../../models/passengers-model");
const { Lines } = require("../../models/lines-model");
const { Drivers } = require("../../models/drivers-model");

let complaintsPost = async (req, res) => {
  let complaint = {
    _passenger: req.body._passenger,
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
  console.log(req.body);

  const updatingResult = await Passengers.findByIdAndUpdate(
    req.body._passenger,
    {
      $push: { _complains: complaint._id }
    }
  );
  if (updatingResult.n == 0) res.send("User Not Found").status(404);

  res.send(complaint);
};

let complaintsGet = async (req, res) => {
  const complaints = await Passengers.findById(req.body.passenger)
    .select("name")
    .populate({
      path: "_complains",
      select: "response text date status code image",
      populate: {
        path: "_trip",
        select: "_id",
        populate: [
          {
            path: "_driver",
            select: "name -_id"
          },
          {
            path: "_line",
            select: "from to cost"
          }
        ]
      }
    });
  res.send(complaints);
};

let tripGet = async (req, res) => {
  const result = await Passengers.findById(req.body.id)
    .select("-_id _pastTrips")
    .populate({
      path: "_pastTrips",
      select: "_id _driver start",
      populate: [
        { path: "_line", select: "from to price" },

        { path: "_driver", select: "name" }
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
