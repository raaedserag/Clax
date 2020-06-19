const { Lines, validateLine } = require("../../models/lines-model");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
module.exports.deleteLine = async (req, res) => {
  const schema = Joi.object().keys({
    lineId: Joi.objectId().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let line = await Lines.findOne({ _id: req.body.lineId });
  if (!line) return res.status(404).send("line doesn't exist!");

  await line.remove();
  res.status(200).send("Deleted Successfully");
};
module.exports.addLine = async (req, res) => {
  const { error } = validateLine(req.body.line);
  if (error) return res.status(400).send(error.details[0].message);

  line = new Lines(req.body.line);
  await line.save();

  res.status(200).send("Line added.");
};
