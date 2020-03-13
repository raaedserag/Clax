const router=require('express').Router();
const {drivers} = require('../controllers/drivers');



router.post('/driver',drivers);

module.exports=router;