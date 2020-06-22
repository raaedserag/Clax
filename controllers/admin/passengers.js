const { Passengers } = require("../../models/passengers-model");
const Joi = require("@hapi/joi");
const RegExps = require("../../validators/regExps");
Joi.objectId = require("joi-objectid")(Joi);

module.exports.getPassengers = async (req, res) => {
  const users = await Passengers.find().select("name phone balance rate");
  res.send(users);
};
module.exports.editPassengers = async (req, res) => {
  const schema = Joi.object().keys({
    id: Joi.objectId().required(),
    firstName: Joi.string().required().trim().min(3).max(64),
    lastName: Joi.string().required(),
    phone: Joi.string()
      .required()
      .trim()
      .min(11)
      .max(11)
      .pattern(RegExps.phoneRegExp, "Phone Number"),
    mail: Joi.string().email().trim().lowercase().min(6).max(64),
    govern: Joi.string()
      .required()
      .valid(
        "الإسكندرية",
        "الإسماعيلية",
        "أسوان",
        "أسيوط",
        "الأقصر",
        "البحيرة",
        "بني سويف",
        "بورسعيد",
        "جنوب سيناء",
        "الجيزة",
        "الدقهلية",
        "دمياط",
        "سوهاج",
        "السويس",
        "الشرقية",
        "الغربية",
        "القاهرة",
        "كفر الشيخ"
      ),
  });

  const { error } = schema.validate(req.body.passenger);
  if (error) return res.status(400).send(error.details[0].message);
  const update = await Passengers.updateOne(
    {
      _id: req.body.passenger.id,
    },
    {
      $set: {
        phone: req.body.passenger.phone,
        name: {
          first: req.body.passenger.firstName,
          last: req.body.passenger.lastName,
        },
        mail: req.body.passenger.mail,
        govern: req.body.passenger.govern,
      },
    }
  );

  res.send("edited");
};
module.exports.getPassengerById = async (req, res) => {
  let params = { id: req.params.id };
  const schema = Joi.object().keys({
    id: Joi.objectId().required(),
  });
  const { error } = schema.validate(params);
  if (error) return res.status(400).send(error.details[0].message);
  const users = await Passengers.findOne({ _id: req.params.id })
    .populate([
      {
        path: "_pastTrips",
        select: "_id",
      },
      {
        path: "_family",
        select: "name",
      },
    ])
    .select("-pass");
  res.send(users);
};
