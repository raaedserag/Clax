const { Lines } = require("../../models/lines-model");
module.exports.deleteLine = async (req, res) => {
  const schema = Joi.object().keys({
    lineId: Joi.objectId().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let line = await Lines.findOne({ _id: req.body.lineId });
  if (!line) return res.status(404).send("line doesn't exist!");

  await offer.remove();
  res.status(200).send("Deleted Successfully");
};
