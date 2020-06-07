// Modules
const express = require("express");
const router = express.Router();
// Middlewares
const authentication = require("../../middlewares/authentication");
// Controllers
const {
  driverLogin,
  driverrRegister,
  driverForgottenPass,
  driverSetNewPass,
} = require("../../controllers/driver/driver-signing");
//------------

// Passengers
router.post("/drivers/login", driverLogin);
router.post("/drivers/register", driverrRegister);
router.post("/drivers/forgotten-password", driverForgottenPass);
router.put("/drivers/set-new-password", authentication, driverSetNewPass);
module.exports = router;
