// Modules
const router = require("express").Router();
const _ = require("lodash");
//Middlewares
const authrization = require("../../middlewares/authentication");

// Controllers

const {
  ChargeOgra,
  ChargeSuccess,
  ChargeCancel,
} = require("../../controllers/payment/paypal-controller");

//charge user balance
router.post("/charge-paypal", authrization, ChargeOgra);

// confirm charge process
router.post("/success/", authrization, ChargeSuccess);

//cancel  charge process
router.get("/cancel", ChargeCancel);

module.exports = router;
