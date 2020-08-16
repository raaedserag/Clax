const { PastTrips } = require("../../models/past-trips-model");
const { Passengers } = require("../../models/passengers-model");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

let pastTrips = async (req, res) => {
  var trips = await Passengers.findById(req.user._id)
    .populate({
      path: "_pastTrips",
      select: "_id date rate feedBack cost seats _tour ",
      populate: {
        path: "_tour",
        select: "_line",
        populate: {
          path: "_line",
          select: "_id from to",
        },
      },
    })
    .select("-_id _pastTrips")
    .lean();

  for (let trip of trips["_pastTrips"]) {
    if (!trip._tour._line) trip._line = "حدث مشكلة في الخط";
    else {
      trip._line = trip._tour._line.to.concat(" - ", trip._tour._line.from);
      delete trip._tour;
    }
  }
  res.send(trips["_pastTrips"]);
};

let getFavourtieTrips = async (req, res) => {
  //   const trips = await PastTrips.find({
  //     _passengers: req.user._id
  //   }).select("-_driver -_passengers");

  let trips = await Passengers.findOne({
    _id: req.user._id,
  })
    .select("-_id _favourites")
    .populate({
      path: "_favourites",
      select: "_line start price",
      populate: [{ path: "_line", select: "-_id from to" }],
    })
    .lean();

  for await (let trip of trips._favourites) {
    if (!trip._line) trip._line = "";
    else trip._line = trip._line.to.concat("-", trip._line.from);
  }

  res.send(trips);
};

let addToFavourite = async (req, res) => {
  //   const trips = await PastTrips.find({
  //     _passengers: req.user._id
  //   }).select("-_driver -_passengers");

  const { error } = validateFavouriteTrips(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let result = await Passengers.updateOne(
    {
      _id: req.user._id,
    },
    {
      $set: { _favourites: req.body.tripsIds },
    },
    {
      multi: true,
    }
  );

  res.status(200).send("Added to favourites");
};

const favouriteTripsSchemas = Joi.object().keys({
  tripsIds: Joi.array().items(Joi.objectId()).required(),
});
const validateFavouriteTrips = function (tripsRequest) {
  return favouriteTripsSchemas.validate(tripsRequest);
};

module.exports.pastTrips = pastTrips;
module.exports.getFavourtieTrips = getFavourtieTrips;
module.exports.addToFavourite = addToFavourite;
