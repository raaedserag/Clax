const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);
const { Offers, validateOffer } = require("../../models/offers-model");
const { Passengers } = require("../../models/passengers-model");
const { sendTopicNotification } = require("../../services/firebase");

module.exports.addOffer = async (req, res) => {
  let { error } = validateOffer(req.body.offer);
  if (error) return res.status(400).send(error.details[0].message);

  let offer = await Offers.findOne({ code: req.body.offer.code });
  if (offer) return res.status(400).send("code already exists.");

  offer = new Offers(req.body.offer);
  await offer.save();

  await sendTopicNotification(
    "passengers",
    {
      title: offer.title.toString(),
      body: offer.description.toString(),
    },
    {
      type: "offer",
      offer: JSON.stringify({
        type: offer.offerType,
        value: offer.value,
        title: offer.title,
        description: offer.description
      })
    }
  )
  res.status(200).send("Offer added.");
};
module.exports.getOffers = async (req, res) => {
  const offers = await Offers.find()
    .select("title code start end offerType value")
    .lean();
  res.status(200).send(offers);
};
module.exports.deleteOffer = async (req, res) => {
  const schema = Joi.object().keys({
    offerId: Joi.objectId().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let offer = await Offers.findOne({ _id: req.body.offerId });
  if (!offer) return res.status(404).send("code doesn't exist!");

  await offer.remove();
  res.status(200).send("Deleted Successfully");
};
