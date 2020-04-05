const { PastTrips } = require("../../models/past-trips-model");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

let pastTrips = async (req, res) => {
  //   const trips = await PastTrips.find({
  //     _passengers: req.passenger._id
  //   }).select("-_driver -_passengers");

  let trips = await PastTrips.find({
    _passengers: req.passenger._id
  })
    .populate("_line", "from to")
    .select("-_driver -_passengers")
    .lean();

  for await (let trip of trips) {
    if (!trip._line) trip._line = "";
    else trip._line = trip._line.to.concat("-", trip._line.from);
  }

  //console.log(trips);
  res.send(trips);
};
let getFavourtieTrips = async (req, res) => {
  //   const trips = await PastTrips.find({
  //     _passengers: req.passenger._id
  //   }).select("-_driver -_passengers");

  let trips = await PastTrips.find({
    _passengers: req.passenger._id,
    is_favourite: true
  })
    .populate("_line", "from to")
    .select("_line start price")
    .lean();

  for await (let trip of trips) {
    if (!trip._line) trip._line = "";
    else trip._line = trip._line.to.concat("-", trip._line.from);
  }

  //console.log(trips);
  res.send(trips);
};

let addToFavourite = async (req, res) => {
  //   const trips = await PastTrips.find({
  //     _passengers: req.passenger._id
  //   }).select("-_driver -_passengers");

  const { error } = validateFavouriteTrips(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let result = await PastTrips.updateMany(
    {
      _id: { $in: req.body.tripsIds },
      _passengers: req.passenger._id
    },
    {
      $set: { is_favourite: true }
    },
    {
      multi: true
    }
  );

  res.status(200).send("Added to favourites");
};
let removeFromFavourites = async (req, res) => {
  //   const trips = await PastTrips.find({
  //     _passengers: req.passenger._id
  //   }).select("-_driver -_passengers");

  const { error } = validateFavouriteTrips(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let result = await PastTrips.updateMany(
    {
      _id: { $in: req.body.tripsIds },
      _passengers: req.passenger._id
    },
    {
      $set: { is_favourite: false }
    },
    {
      multi: true
    }
  );

  res.status(200).send("Added to favourites");
};

const favouriteTripsSchemas = Joi.object().keys({
  tripsIds: Joi.array()
    .items(Joi.objectId())
    .required()
});
const validateFavouriteTrips = function(tripsRequest) {
  return favouriteTripsSchemas.validate(tripsRequest);
};

module.exports.pastTrips = pastTrips;
module.exports.getFavourtieTrips = getFavourtieTrips;
module.exports.addToFavourite = addToFavourite;
module.exports.removeFromFavourites = removeFromFavourites;
