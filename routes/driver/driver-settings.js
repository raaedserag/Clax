// Modules
const express = require("express");
const router = express.Router();
// Middlewares
const authentication = require("../../middlewares/authentication");
// Controllers
const { driverInfo } = require("../../controllers/driver/driver-settings");
//------------

router.get("/me", driverInfo);
module.exports = router;
