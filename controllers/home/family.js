const { Passengers } = require("../../models/passengers-model");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

let getFamilyMembers = async (req, res) => {
  let familyMembers = await Passengers.findOne({
    _id: req.passenger._id
  })
    .populate("_family", "name phone")
    .select("_family");

  res.send(familyMembers._family);
};

let fetchSentRequests = async (req, res) => {
  let MembersSentRequests = await Passengers.find({
    _familyRequests: req.passenger._id
  }).select("_id name phone");

  res.send(MembersSentRequests);
};

let deleteFamilyMember = async (req, res) => {
  // const { error } = validateSentRequest(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  const deletedMember = await Passengers.findOne({
    _id: req.passenger._id,
    _family: req.body._id
  }).select("_id");

  if (!deletedMember)
    return res.status(404).send("user not found in your family");

  result = await Passengers.updateOne(
    {
      _id: deletedMember._id
    },
    {
      $pull: { _family: req.body._id }
    }
  );

  res.status(200).send("member deleted");
};

let sendFamilyRequest = async (req, res) => {
  const { error } = validateSentRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const receipient = await Passengers.findOne({
    phone: req.body.phone
  }).select("_id");

  if (!receipient) return res.status(404).send("user not found");

  if (receipient._id == req.passenger._id)
    return res.status(400).send("you can't add yourself");

  //check if the sent passenger is already in user's family
  const familyMember = await Passengers.findOne({
    _id: req.passenger._id,
    _family: receipient._id
  }).select("_id");

  if (familyMember)
    return res.status(400).send("Member already in your family");

  //check if the passenger has already sent a request
  const oldRecepient = await Passengers.findOne({
    _id: receipient._id,
    _familyRequests: req.passenger._id
  }).select("_id");

  if (oldRecepient) return res.status(400).send("You already sent a request");

  result = await Passengers.updateOne(
    {
      _id: receipient._id
    },
    {
      $push: { _familyRequests: req.passenger._id }
    }
  );

  res.status(200).send("request sent");
};

let cancelFamilyRequest = async (req, res) => {
  const { error } = validateCancelledRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const receipient = await Passengers.findOne({
    _id: req.body.recipientId,
    _familyRequests: req.passenger._id
  }).select("_id");

  if (!receipient)
    return res.status(404).send("there is no request with the given user");

  result = await Passengers.updateOne(
    {
      _id: req.body.recipientId
    },
    {
      $pull: { _familyRequests: req.passenger._id }
    }
  );

  res.status(200).send("request canceled");
};

const fetchRequests = async (req, res) => {
  const familyRequests = await Passengers.findById(req.passenger._id)
    .select("_familyRequests -_id")
    .populate({ path: "_familyRequests", select: "name phone" });
  res.send(familyRequests._familyRequests);
};

const acceptRequest = async (req, res) => {
  let result = await Passengers.findOneAndUpdate(
    {
      _id: req.passenger._id,
      _familyRequests: req.body.acceptedId
    },
    {
      $push: { _family: req.body.acceptedId },
      $pull: { _familyRequests: req.body.acceptedId }
    }
  );
  if (!result) return res.send("User Not Found !").status(404);

  res.send("Request Accepted").status(200);
};

const denyRequest = async (req, res) => {
  const result = await Passengers.findOneAndUpdate(
    {
      _id: req.passenger._id,
      _familyRequests: req.body.deniedId
    },
    {
      $pull: { _familyRequests: req.body.deniedId }
    }
  );
  if (!result) return res.send("User Not Found !").status(404);

  res.send("Request Denied").status(200);
};

const sentRequestSchema = Joi.object().keys({
  phone: Joi.string()
    .required()
    .trim()
    .min(11)
    .max(11)
    .required()
});
const validateSentRequest = function(reqBody) {
  return sentRequestSchema.validate(reqBody);
};

const cancelledRequestSchema = Joi.object().keys({
  recipientId: Joi.objectId().required()
});
const validateCancelledRequest = function(reqBody) {
  return cancelledRequestSchema.validate(reqBody);
};

module.exports.getFamilyMembers = getFamilyMembers;
module.exports.sendFamilyRequest = sendFamilyRequest;
module.exports.cancelFamilyRequest = cancelFamilyRequest;
module.exports.fetchRequests = fetchRequests;
module.exports.acceptRequest = acceptRequest;
module.exports.denyRequest = denyRequest;
module.exports.deleteFamilyMember = deleteFamilyMember;
module.exports.fetchSentRequests = fetchSentRequests;
