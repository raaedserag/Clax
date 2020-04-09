const router = require("express").Router();
const authentication = require("../../middlewares/authentication");
const { drivers } = require("../../controllers/pairing/drivers");
const { lines } = require("../../controllers/pairing/lines");
const { locStation } = require("../../controllers/pairing/stations");
const { createNewLine } = require("../../controllers/pairing/geoJson");
const router = require("express").Router();
const { drivers } = require("../../controllers/pairing/drivers");
const { lines } = require("../../controllers/pairing/lines");
const { locStation } = require("../../controllers/pairing/stations");

router.post("/station", locStation);

router.post("/station", authentication, locStation);
router.post("/line", lines);

router.post("/driver", drivers);

router.get("/line", authentication, lines);

router.post("/driver", authentication, drivers);

router.post("/create-line", authentication, createNewLine);

module.exports = router;
module.exports = router;
