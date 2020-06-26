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
  getOffers } = require("../../controllers/home/settings-controller")
//---------------------

router.get("/me", getMe);
router.put("/me", updateMe);

router.post("/mail-verification", requestMailVerification);
router.put("/mail-verification", confirmMail);

router.post("/phone-verification", requestPhoneVerification)
router.put("/phone-verification", confirmPhone);

router.get("/get-offers", getOffers)
module.exports = router;
