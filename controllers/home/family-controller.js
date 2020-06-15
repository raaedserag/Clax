const { Passengers } = require("../../models/passengers-model");
const { encodeId, decodeId } = require("../../helpers/encryption-helper");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

let getFamilyMembers = async (req, res) => {
  let familyMembers = await Passengers.findOne({
    _id: req.user._id,
  })
    .populate("_family", "name phone")
    .select("_family");
  familyMembers._family.forEach((familyMemberId) => {
    familyMemberId = encodeId(familyMemberId);
  });

  return familyMembers._family;
};

let fetchSentRequests = async (req, res) => {
  let MembersSentRequests = await Passengers.find({
    _familyRequests: req.user._id,
  }).select("_id name phone");
  MembersSentRequests.forEach((familyMember) => {
    familyMember = encodeId(familyMember._id);
  });
  return MembersSentRequests;
};

let deleteFamilyMember = async (req, res) => {
  try {
    const decodedId = decodeId(req.body._id);
    const deletedMember = await Passengers.findOne({
      _id: req.user._id,
      _family: decodedId,
    }).select("_id");

    if (!deletedMember)
      return res.status(404).send("user not found in your family");

    result = await Passengers.updateOne(
      {
        _id: deletedMember._id,
      },
      {
        $pull: { _family: decodedId },
      }
    );

    res.status(200).send("member deleted");
  } catch (error) {
    return res.status(400).send("Wrong ID Format");
  }
};

let sendFamilyRequest = async (req, res) => {
  const { error } = validateSentRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const receipient = await Passengers.findOne({
    phone: req.body.phone,
  }).select("_id");

  if (!receipient) return res.status(404).send("user not found");

  if (receipient._id == req.user._id)
    return res.status(400).send("you can't add yourself");

  //check if the sent passenger is already in user's family
  const familyMember = await Passengers.findOne({
    _id: req.user._id,
    _family: receipient._id,
  }).select("_id");

  if (familyMember)
    return res.status(400).send("Member already in your family");

  //check if the passenger has already sent a request
  const oldRecepient = await Passengers.findOne({
    _id: receipient._id,
    _familyRequests: req.user._id,
  }).select("_id");

  if (oldRecepient) return res.status(400).send("You already sent a request");

  result = await Passengers.updateOne(
    {
      _id: receipient._id,
    },
    {
      $push: { _familyRequests: req.user._id },
    }
  );

  res.status(200).send("request sent");
};

let cancelFamilyRequest = async (req, res) => {
  const { error } = validateCancelledRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const receipient = await Passengers.findOneAndUpdate(
    {
      phone: req.body.phone,
      _familyRequests: req.user._id,
    },
    {
      $pull: { _familyRequests: req.user._id },
    }
  ).select("_id");

  if (!receipient)
    return res.status(404).send("there is no request with the given user");

  res.status(200).send("request canceled");
};

const fetchRequests = async (req, res) => {
  const familyRequests = await Passengers.findById(req.user._id)
    .select("_familyRequests -_id")
    .populate({ path: "_familyRequests", select: "name phone" });
  return familyRequests._familyRequests;
};

const acceptRequest = async (req, res) => {
  try {
    const acceptedId = decodeId(req.body.acceptedId);
    let result = await Passengers.findOneAndUpdate(
      {
        _id: req.user._id,
        _familyRequests: acceptedId,
      },
      {
        $push: { _family: acceptedId },
        $pull: { _familyRequests: acceptedId },
      }
    );
    if (!result) return res.send("User Not Found !").status(404);

    res.send("Request Accepted").status(200);
  } catch (error) {
    return res.status(400).send("Wrong ID Format");
  }
};

const getFamilyInfo = async (req, res) => {
  let info = { familyMembers: [], receivedRequests: [], sentRequests: [] };
  info.familyMembers = await getFamilyMembers(req, res);
  info.receivedRequests = await fetchRequests(req, res);
  info.sentRequests = await fetchSentRequests(req, res);
  return res.status(200).send(info);
};

const denyRequest = async (req, res) => {
  try {
    const deniedId = decodeId(req.body.deniedId);
    const result = await Passengers.findOneAndUpdate(
      {
        _id: req.user._id,
        _familyRequests: deniedId,
      },
      {
        $pull: { _familyRequests: deniedId },
      }
    );
    if (!result) return res.send("User Not Found !").status(404);

    res.status(200).send("Request Denied");
  } catch (error) {
    return res.status(400).send("Wrong ID Format");
  }
};

const sentRequestSchema = Joi.object().keys({
  phone: Joi.string().required().trim().min(11).max(11).required(),
});

const validateSentRequest = function (reqBody) {
  return sentRequestSchema.validate(reqBody);
};

const cancelledRequestSchema = Joi.object().keys({
  phone: Joi.string().required().trim().min(11).max(11).required(),
});
const validateCancelledRequest = function (reqBody) {
  return cancelledRequestSchema.validate(reqBody);
};

module.exports.getFamilyInfo = getFamilyInfo;
module.exports.sendFamilyRequest = sendFamilyRequest;
module.exports.cancelFamilyRequest = cancelFamilyRequest;
module.exports.acceptRequest = acceptRequest;
module.exports.denyRequest = denyRequest;
module.exports.deleteFamilyMember = deleteFamilyMember;
