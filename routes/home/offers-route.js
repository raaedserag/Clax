const { Offers, validateOfferCode } = require("../../models/offers-model");
const { Passengers } = require("../../models/passengers-model")
const authentication = require("../../middlewares/authentication");
const express = require("express");
const _ = require("lodash");

const router = express.Router();

//recieve offer request from user.
router.post("/", authentication, async (req, res) => {
  //check if the offer code is valid.
  const { error } = validateOfferCode(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // check if code exists.
  let offer = await Offers.findOne({ code: req.body.code });
  if (!offer) return res.status(404).send("هذا العرض غير متاح حالياً.");

  //check if passenger already used the code.

  const passengerId = offer._passengers.find(x => x == req.user._id);

  if (passengerId) return res.status(400).send("لقد استخدمت هذا العرض مسبقاً.");

  //push the passenger Id to the offer array.
  offer._passengers.push(req.user._id);
  //save offer to the database.
  await offer.save();

  // Pushing offers to the passengers offers
  await Passengers.findByIdAndUpdate(req.user._id,
    {
      $push: { _offers: offer._id }
    })

  //send Ok Status to user.
  res.status(200).send("تم تفعيل العرض.");
});

module.exports = router;
