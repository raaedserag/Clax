// Modules
const express = require("express");
const router = express.Router();
// Controllers
const { passengerSignIn,
  passengerSignUp,
  passengerForgottenPass } = require("../../controllers/signing/passengers-signing-controller")
//------------

// Passengers
router.post("/passengers/sign-in", passengerSignIn);
router.post("/passengers/sign-up", passengerSignUp);
router.post("/passengers/forgotten-password", passengerForgottenPass);

module.exports = router;
