const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
const { Complaints } = require("../../models/complaints-model");
module.exports.getComplaints = async (req, res) => {
  const complaints = await Complaints.find()
    .populate([
      {
        path: "_trip",
        select: "_id _driver start price rate _line",
        populate: [
          { path: "_line", select: "-_id from to" },
          { path: "_driver", select: "-_id name phone" },
        ],
      },
      {
        path: "_passenger",
        select: "_id name rate",
      },
    ])
    .lean();

  res.send(complaints);
};
module.exports.getComplaintById = async (req, res) => {
  let params = { id: req.params.id };
  const schema = Joi.object().keys({
    id: Joi.objectId().required(),
  });
  const { error } = schema.validate(params);
  if (error) return res.status(400).send(error.details[0].message);
  const complaints = await Complaints.findOne({ _id: req.params.id })
    .populate([
      {
        path: "_trip",
        select: "_id _driver start price rate _line",
        populate: [
          { path: "_line", select: "-_id from to" },
          { path: "_driver", select: "-_id name phone profilePic" },
        ],
      },
      {
        path: "_passenger",
        select: "_id name rate",
      },
    ])
    .lean();

  res.send(complaints);
};
module.exports.respondToComplaint = async (req, res) => {
  let params = { id: req.params.id, response: req.body.response };
  const schema = Joi.object().keys({
    id: Joi.objectId().required(),
    response: Joi.string().required(),
  });

  const { error } = schema.validate(params);
  if (error) return res.status(400).send(error.details[0].message);
  const complaints = await Complaints.updateOne(
    { _id: req.params.id },
    {
      $set: { status: "resolved", response: req.body.text },
    }
  );

  res.send("successful");
};
