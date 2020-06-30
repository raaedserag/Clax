// Models And Validators
const { validateComplaint } = require("../../models/complaints-model");
const { Passengers } = require("../../models/passengers-model");
// Helpers
const { pushPassengerComplain } = require("../../helpers/complaints-helper");
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
    .select("-_id _complaints")
    .populate({
      path: "_complaints",
      select: "-_id response subject text date status code _trip",
      populate: {
        path: "_trip",
        select: "-_id _tour",
        populate: {
          path: "_tour",
          select: "-_id _driver _line direction",
          populate: [
            {
              path: "_driver",
              select: "-_id name profilePic",
            },
            {
              path: "_line",
              select: "-_id from to",
            },
          ],
        },
      },
    })
    .lean();
  for (let complain of complaints["_complaints"]) {
    if (complain._trip) {
      if (!complain._trip._tour._line)
        complain._trip._tour._line = "حدث مشكلة في الخط";
      else {
        if (complain._trip._tour.direction == 0)
          complain._trip._line =
            complain._trip._tour._line.from +
            " - " +
            complain._trip._tour._line.to;
        else
          complain._trip._line =
            complain._trip._tour._line.to +
            " - " +
            complain._trip._tour._line.from;
      }
      complain._trip._driver = complain._trip._tour._driver;
    }
  }
  res.send(complaints["_complaints"]);
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
