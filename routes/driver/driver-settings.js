// Modules
const express = require("express");
const router = express.Router();
// Middlewares
const authentication = require("../../middlewares/authentication");
const { authorizeDriver } = require("../../middlewares/authorization");
// Controllers
const {
  driverInfo,
  updateMe,
  requestPhoneVerification,
  confirmPhone,
  startTour,
  endTour,
} = require("../../controllers/driver/driver-settings");
//------------

router.get("/me", driverInfo);
router.put("/me", updateMe);

router.post("/phone-verification", requestPhoneVerification);
router.put("/phone-verification", confirmPhone);

router.post("/start-tour", [authentication, authorizeDriver], startTour);
router.post("/end-tour", [authentication, authorizeDriver], endTour);
module.exports = router;
