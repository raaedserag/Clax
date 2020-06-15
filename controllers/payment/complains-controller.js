// Models And Validators
const {
  Complains,
  validateComplaint,
} = require("../../models/complains-model");
const { Passengers } = require("../../models/passengers-model");
// Helpers
const { pushPassengerComplain } = require("../../helpers/complains-helper");
//--------------------

module.exports.complaintsPost = async (req, res) => {
  // Creating new complain object
  let complaint = {
    _passenger: req.user._id,
    _trip: req.body._trip,
    text: req.body.text,
    subject: req.body.subject,
    from_passenger: req.body.from_passenger,
    code: Date.now(),
    date: Date.now(),
  };
  const { error } = validateComplaint(complaint);
  if (error) return res.status(400).send(error.details[0].message);

  // Push complain
  complaint = await pushPassengerComplain(req.user._id, complaint);
  res.send(complaint);
};

module.exports.complaintsGet = async (req, res) => {
  const complaints = await Passengers.findById(req.user._id)
    .select("-_id _complains")
    .populate({
      path: "_complains",
      select: "-_id response subject text date status code _trip",
    })
    .lean();
  res.send(complaints["_complains"]);
};

module.exports.tripGet = async (req, res) => {
  const result = await Passengers.findById(req.user._id)
    .select("-_id _pastTrips")
    .populate({
      path: "_pastTrips",
      select: "_id _driver start price",
      populate: [
        { path: "_line", select: "-_id from to" },
        { path: "_driver", select: "-_id name profilePic" },
      ],
    })
    .lean();
  res.send(result);
};
