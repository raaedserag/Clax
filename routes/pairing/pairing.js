const router = require('express').Router();
const authentication = require("../../middlewares/authentication");
const { drivers } = require('../../controllers/pairing/drivers');
const { lines } = require('../../controllers/pairing/lines');
const { locStation } = require('../../controllers/pairing/stations');
const { createNewLine } = require('../../controllers/pairing/geoJson')


router.post('/station', authentication, locStation);
router.get('/line', authentication, lines);
router.post('/driver', drivers);
router.post('/create-line', authentication, createNewLine)

module.exports = router;
