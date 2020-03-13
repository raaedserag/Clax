const router=require('express').Router();
const {drivers} = require('../controllers/drivers');
const { lines } = require('../controllers/lines');
const {locStation} = require('../controllers/stations');


router.post('/station',locStation);


router.post('/line', lines);


router.post('/driver',drivers);

module.exports=router;