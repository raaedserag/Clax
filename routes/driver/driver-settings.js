// Modules
const express = require("express");
const router = express.Router();
// Middlewares
const authentication = require("../../middlewares/authentication");
const { authorizeDriver } = require("../../middlewares/authorization")
// Controllers
const { driverInfo, startTour, endTour } = require("../../controllers/driver/driver-settings");
//------------

router.get("/me", driverInfo);
router.post("/start-tour", [authentication, authorizeDriver], startTour)
router.post("/end-tour", [authentication, authorizeDriver], endTour)
module.exports = router;
