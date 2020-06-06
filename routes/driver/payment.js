// Modules
const express = require("express");
const router = express.Router();
// Middlewares
const authentication = require("../../middlewares/authentication");
// Controllers
const { getPaymentInfo } = require("../../controllers/driver/payment-details");
//------------

router.get("/drivers/payment/details", getPaymentInfo);
module.exports = router;
