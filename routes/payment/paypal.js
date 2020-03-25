// Modules
const router = require("express").Router();
const _ = require("lodash");
// Controllers
const paypalController = require("../../controllers/payment/paypal");

const {
    ChargeOgra,
    ChargeSuccess,
    ChargeCancel
  } = require("../../controllers/payment/paypal");


router.post("/charge", ChargeOgra);
router.get("/success/:id/:amount/:type", ChargeSuccess);
router.get("/cancel", ChargeCancel);

module.exports = router;