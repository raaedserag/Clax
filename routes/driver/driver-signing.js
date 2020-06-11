// Modules
const express = require("express");
const router = express.Router();
// Middlewares
const authentication = require("../../middlewares/authentication");
// Controllers
const {
  driverLogin,
  driverRegister,
  driverForgottenPass,
  driverSetNewPass,
} = require("../../controllers/driver/driver-signing");
//------------

// Passengers
router.post("/login", driverLogin);
router.post("/register", driverRegister);
router.post("/forgotten-password", driverForgottenPass);
router.put("/set-new-password", authentication, driverSetNewPass);
module.exports = router;
