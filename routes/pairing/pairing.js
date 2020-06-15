const router = require("express").Router();
const { lines } = require("../../controllers/pairing/lines");
const authentication = require("../../middlewares/authentication");
const { locStation } = require("../../controllers/pairing/stations");
const { createNewLine } = require("../../controllers/pairing/geoJson");
const { findDriver, finishTrip, getDriverInfo } = require("../../controllers/pairing/pairing");

router.post("/station", authentication, locStation);
router.get("/line", authentication, lines);
router.post("/find-driver", findDriver);
router.post("/driver-info", getDriverInfo)
router.post("/finish-trip", authentication, finishTrip);
router.post("/create-line", authentication, createNewLine);

module.exports = router;
