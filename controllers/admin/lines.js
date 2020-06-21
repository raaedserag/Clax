const { Lines, validateLineAdmin } = require("../../models/lines-model");
const { Stations, validateStations } = require("../../models/stations-model");
const { startTransaction } = require("../../db/db");
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
  const { errorLines } = validateLineAdmin(req.body.line);
  if (errorLines) return res.status(400).send(error.details[0].message);

  const { error } = validateStations(req.body.line._stations);
  if (error) return res.status(400).send(error.details[0].message);

  let session = null;
  try {
    // Start Transaction Session
    session = await startTransaction();

    let stations = await Stations.insertMany(req.body.line._stations, {
      session,
    });

    let line = await Lines.create(
      [
        {
          from: req.body.line.from,
          to: req.body.line.to,
          cost: req.body.line.cost,
          _stations: stations,
        },
      ],
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw new Error("Transaction Failed !\n" + error.message);
  }

  return res.status(200).send("Line added.");
};
