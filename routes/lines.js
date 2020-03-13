const router = require('express').Router();
const { lines } = require('../controllers/lines');



router.post('/line', lines);

module.exports = router;