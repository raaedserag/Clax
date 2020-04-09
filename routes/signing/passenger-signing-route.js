// Modules
const express = require("express");
const router = express.Router();
// Middlewares
const authentication = require("../../middlewares/authentication")
// Controllers
const { passengerLogin,
  passengerRegister,
  passengerForgottenPass,
  passengerSetNewPass } = require("../../controllers/signing/passengers-signing-controller")
//------------

// Passengers
router.post("/passengers/login", passengerLogin);
router.post("/passengers/register", passengerRegister);
router.post("/passengers/forgotten-password", passengerForgottenPass);
router.put("/passengers/set-new-password", authentication, passengerSetNewPass)
module.exports = router;
