const { Passengers } = require("../models/passengers-model");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
const winston = require('winston')

let getFamilyMembers = async (req, res) => {
  //   const trips = await PastTrips.find({
  //     _passengers: req.passenger._id
  //   }).select("-_driver -_passengers");

  let familyMembers = await Passengers.find({
    _id: req.passenger._id
  })
    .populate("_family", "name")
    .select("_family");
  res.send(familyMembers);
};

let addMember = async (req, res) => {
  const familyMember = await Passengers.findOne({
    phone: req.body.phone
  }).select("_id");

  if (!familyMember) return res.status(404).send("user not found");

  if (familyMember._id == req.passenger._id)
    return res.status(400).send("you can't add yourself");

  //check if the sent passenger is already in user's family
  const oldFamilyMember = await Passengers.findOne({
    _id: req.passenger._id,
    _family: familyMember._id
  }).select("_id");

  if (toString(familyMember._id) == toString(oldFamilyMember._id))
    return res.status(400).send("Member already added");

  let result = await Passengers.updateOne(
    {
      _id: req.passenger._id
    },
    {
      $push: { _family: familyMember._id }
    }
  );

  res.status(200).send("member added");
};

let removeMember = async (req, res) => {
  const passenger = await Passengers.findOne({
    phone: req.body.phone
  }).select("_id");

  if (!passenger) return res.status(404).send("user not found");

  const familyMember = await Passengers.findOne({
    _id: req.passenger._id,
    _family: passenger._id
  }).select("_id");

  if (!familyMember)
    return res.status(404).send("the passenger is not in your family");

  let result = await Passengers.updateOne(
    {
      _id: req.passenger._id
    },
    {
      $pull: { _family: familyMember._id }
    }
  );

  res.status(200).send("member deleted");
};

const fetchRequests = async(req, res) => {
  const familyRequests = await Passengers.findById(req.passenger._id)
    .select("_familyRequests -_id")
    .populate({path: '_familyRequests', select: 'name phone'})
  res.send(familyRequests)
}

const acceptRequest = async(req, res) => {
  const result = await Passengers.findOneAndUpdate(
    {
      _id: req.passenger._id
    },
    {
      $push: {_family: req.body.acceptedId},
      $pull: {_familyRequests: req.body.acceptedId}
    }
  )
  if (result.n == 0) res.send("User Not Found !").status(404)

  res.send('Request Accepted').status(200)
}

const denyRequest = async(req, res) => {
  const result = await Passengers.findOneAndUpdate(
    {
      _id: req.passenger._id
    },
    {
      $pull: {_familyRequests: req.body.acceptedId}
    }
  )
  if (result.n == 0) res.send("User Not Found !").status(404)

  res.send('Request Denied').status(200)
}
const favouriteTripsSchemas = Joi.object().keys({
  tripsIds: Joi.array()
    .items(Joi.objectId())
    .required()
});
const validateFavouriteTrips = function(tripsRequest) {
  return favouriteTripsSchemas.validate(tripsRequest);
};

module.exports.getFamilyMembers = getFamilyMembers;
module.exports.addMember = addMember;
module.exports.removeMember = removeMember;
module.exports.fetchRequests = fetchRequests;
module.exports.acceptRequest = acceptRequest;
module.exports.denyRequest = denyRequest;
