const router=require('express').Router();
const {drivers} = require('../../controllers/pairing/drivers');
const { lines } = require('../../controllers/pairing/lines');
const {locStation} = require('../../controllers/pairing/stations');
const {createNewLine} = require('../../controllers/pairing/geoJson')


router.post('/station',locStation);


router.post('/line', lines);


router.post('/driver',drivers);


router.post('/create-line', createNewLine)

module.exports=router;