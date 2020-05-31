// Models
const { Drivers } = require("../../models/drivers-model");
const { PastTrips } = require("../../models/past-trips-model");
// Services
const { sendTargetedNotification } = require("../../services/firebase");
// Helpers
const {
  minimumDistanceIndex,
  adjustBalance,
} = require("../../helpers/drivers-helper");
// Validators
const {
  validateFindDriverRequest,
  validateFinishTripRequest,
} = require("../../validators/pairing-validators");
//-----------

module.exports.findDriver = async (req, res) => {
  // Validate request schema
  const { error } = validateFindDriverRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Retreiving Drivers currently Available

  // =======================

  // =====KINDLY-EDIT-THIS======  
  // Retrieve locations of drivers from firebase using thier ids
  // Dummy Data
  const dummyDestination = [
    { lat: 55, lng: -110 },
    { lat: 50, lng: -110 },
    { lat: 40, lng: -110 },
  ];
  // =======================

  // Retreive index of Closest Driver
  let index = await minimumDistanceIndex([req.body.loc], dummyDestination);

  // Get Driver Information
  let selectedDriver = driversIds[index];

  // =====KINDLY-EDIT-THIS======
  // Driver's Model should have firebasetToken ... Add it
  var driverInfo = await Drivers.findById(selectedDriver)
    .select("_id name img phone car _currentCar firebaseToken")
    .lean();
  // =========================

  // Send Notification Message
  await sendTargetedNotification(driverInfo.firebaseToken);
  res.status(200).send(driverInfo);
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
