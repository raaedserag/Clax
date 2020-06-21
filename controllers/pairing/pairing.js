// Models
const { PastTour } = require("../../models/past-tours-model");
// Helpers
const { getAvailableDrivers,
  createNewTrip,
} = require("../../helpers/pairing-helper");
// Validators
const {
  validateFindDriverRequest,
  validateGetDriverInfo
} = require("../../validators/pairing-validators");
//-----------

module.exports.findDriver = async (req, res) => {
  try {
    // Validate request schema
    const { error } = validateFindDriverRequest(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Retrieving sorted array of available drivers, according to line ID and required seats & station Name
    const result = await getAvailableDrivers(
      { user: req.body.pickupLoc, dest: req.body.destLoc },
      { id: req.body.lineId, direction: req.body.direction },
      req.body.requiredSeats
    );

    // Create new trip request, and respond with the tripId
    const tripId = await createNewTrip(
      {
        lineId: req.body.lineId,
        seats: req.body.requiredSeats,
        stationLoc: req.body.pickupLoc,
        stationName: result.stationName,
      },
      result.drivers,
      req.user._id
    )
    res.send(tripId);

  } catch (error) {
    throw new Error(error.message);
  }
};

// Get Driver Info (as a passenger)
module.exports.getDriverInfo = async (req, res) => {
  // Validate request schema
  const { error } = validateGetDriverInfo(req.body);
  if (error) return res.status(400).send(error.details[0].message);


  const result = await PastTour.findById(req.body.tourId)
    .select("-_id _driver")
    .populate({
      path: "_driver",
      select: "-_id name phone profilePic _currentCar",
      populate: {
        path: "_currentCar",
        select: "-_id color plateNumber",
      }
    })
  res.send(result._driver)
};

