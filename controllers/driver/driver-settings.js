const bcrypt = require("bcrypt");
const _ = require("lodash");
// Configuration & Secrets
const { host, port } = require("../../startup/config").serverConfig();
// Models & Validators
const { Drivers } = require("../../models/drivers-model");
const { PastTour } = require("../../models/past-tours-model")
const { validateStartTourRequest, validateEndTourRequest } = require("../../validators/settings-validator")
// Services & Helpers
const { addTour, removeTour } = require("../../services/firebase")
//----------------------------------------------------
module.exports.driverInfo = async (req, res) => {
  const driver = await Drivers.findById(req.user._id)
    .populate("_cars", "color plateNumber")
    .select("-_id name phone profilePic _cars");
  return res.send(driver);
};

module.exports.startTour = async (req, res) => {
  // Validate Tour schema
  const { error, value } = validateStartTourRequest(req.body)
  if (error) res.status(400).send(error.details[0].message)

  // Register a new tour
  const tour = await PastTour.create({
    date: Date.now(),
    direction: value.direction,
    _line: value.lineId,
    _driver: req.user._id
  })
  if (!tour._id) throw new Error("Can't start tour")

  // Push the tour to the driver's tours
  await Drivers.findOneAndUpdate({ _id: req.user._id },
    { $push: { _tours: tour._id } })

  // Broadcast the tour 
  await addTour(`${value.lineId}/${tour._id}`,
    _.pick(value, ["direction", "seats", "loc"]))
  // Respond with it's id 
  res.send(tour._id)
};

module.exports.endTour = async (req, res) => {
  // request Validation
  const { error, value } = validateEndTourRequest(req.body)
  if (error) res.status(400).send(error.details[0].message)

  // Stop tour broadcasting
  await removeTour(`${value.lineId}/${value.tourId}`)

  res.sendStatus(200)
};
