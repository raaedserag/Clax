const router = require('express').Router();
const {locStation} = require('../controllers/stations');
const {lines} = require('../controllers/stations');



router.post('/station',locStation);




module.exports=router;