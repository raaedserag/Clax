// Modules
const express = require("express");
const router = express.Router();
// Middlewares
const authentication = require("../../middlewares/authentication");
// Controllers
const {
  d_balance,
  d_history,
  b_history,
} = require("../../controllers/driver/payment-details");
//------------

router.get("/mybalance", d_balance); //req with id to get balance
router.get("/myhistory", d_history); //req with id to get history
router.get("/b_history", b_history); //req with id to get balance & history

module.exports = router;
