// Models
const { Drivers } = require("../../models/drivers-model");
const { PastTrips } = require("../../models/past-trips-model");
// Helpers
const { getAvailableDrivers } = require("../../helpers/drivers-helper");
const { adjustBalance,
  createNewTrip } = require('../../helpers/pairing-helpers')

// Validators
const {
  validateFindDriverRequest,
  validateFinishTripRequest,
} = require("../../validators/pairing-validators");
//-----------

module.exports.findDriver = async (req, res) => {
  try {
    // Validate request schema
    const { error } = validateFindDriverRequest(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Retrieving sorted array of available drivers, according to line ID and required seats & station Name
    const result = await getAvailableDrivers(req.body.stationLoc,
      req.body.lineId,
      req.body.requiredSeats);

    // Create new trip request, and respond with the tripId
    res.send(await createNewTrip(
      {
        lineId: req.body.lineId,
        seats: req.body.requiredSeats,
        stationLoc: req.body.stationLoc,
        stationName: result.stationName
      },
      result.drivers))

  } catch (error) {
    throw new Error(error.message)
  }

};

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
