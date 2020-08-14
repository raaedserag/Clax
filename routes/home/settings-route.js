// Modules
const express = require("express");
const router = express.Router();
// Controllers
const { getMe,
  updateMe,
  requestMailVerification,
  confirmMail,
  requestPhoneVerification,
  confirmPhone,
  claimOffer,
  getOffers } = require("../../controllers/home/settings-controller")
//---------------------

router.get("/me", getMe);
router.put("/me", updateMe);

router.post("/mail-verification", requestMailVerification);
router.put("/mail-verification", confirmMail);

router.post("/phone-verification", requestPhoneVerification)
router.put("/phone-verification", confirmPhone);

router.post("/claim-offer", claimOffer)
router.get("/get-offers", getOffers)
const { GET, SET } = require("../../db/cache")
const { Passengers } = require("../../models/passengers-model")
router.post("/test", async (req, res) => {
  let t = await GET(req.body.key)
  if (!t) {
    t = await Passengers.findById("5ec456fa72ef0e0045c01db7")
      .select(`-_id ${req.body.key}`)
    SET(req.body.key, JSON.stringify(t))
  }
  res.send(t)
})
module.exports = router;
