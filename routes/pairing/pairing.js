const router = require("express").Router();
const { drivers } = require("../../controllers/pairing/drivers");
const { lines } = require("../../controllers/pairing/lines");
const { locStation } = require("../../controllers/pairing/stations");

router.post("/station", locStation);

router.post("/line", lines);

router.post("/driver", drivers);

module.exports = router;
