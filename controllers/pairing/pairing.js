// Models
const { Drivers } = require("../../models/drivers-model");
const { PastTrips } = require("../../models/past-trips-model");
const { Cars } = require('../../models/cars-model')
// Helpers
const {
  adjustBalance,
  getAvailableDrivers,
  createNewTrip,
} = require("../../helpers/pairing-helpers");

// Validators
const {
  validateFindDriverRequest,
  validateFinishTripRequest,
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
      result.drivers
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


  const result = await Drivers.findById(req.body.driverId)
    .select('-_id name phone profilePic')
    .populate('_currentCar', '-_id color plateNumber')

  res.send(result)
}

module.exports.finishTrip = async (req, res) => {
  // Validate request schema
  const { error } = validateFinishTripRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Add Description if available
  if (req.body.trip.description != null) {
    // Retreive TripID
    const updatingResult = await PastTrips.findByIdAndUpdate(tripId, {
      $push: { _description: req.body.description },
    });
    if (updatingResult.n == 0) throw new Error("Trip Error Occured");
  }

  // Update Passenger's Balance
  let result = await adjustBalance(
    req.user._id,
    req.body.driverId,
    req.body.trip
  );
  if (!result) return res.status(400).send("Balance Adjustment Error Occured");

  // Real Time Rate System
  const Rate = await Drivers.findByIdAndUpdate(req.body.driverId, {
    $inc: { rate: -parseFloat(req.body.trip.rate / 5) },
  });
  res.status(200).send("Done");
};
