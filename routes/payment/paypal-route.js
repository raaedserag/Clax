// Modules
const router = require("express").Router();
const _ = require("lodash");
//Middlewares
const authrization = require("../../middlewares/authentication");

// Controllers

const {
  ChargeOgra,
  ChargeSuccess,
  ChargeCancel
} = require("../../controllers/payment/paypal-controller");

//charge user balance
router.post("/charge", authrization, ChargeOgra);

// confirm charge process
router.get("/success/:id/:amount", ChargeSuccess);
//cancel  charge process
router.get("/cancel", authrization, ChargeCancel);

module.exports = router;
