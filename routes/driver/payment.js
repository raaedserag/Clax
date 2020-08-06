// Modules
const express = require("express");
const router = express.Router();
// Middlewares
const authentication = require("../../middlewares/authentication");
// Controllers
const {
  balance,
  history,
  balanceHistory,
} = require("../../controllers/driver/payment-details");
//------------

// Balance
router.get("/balance", balance);

// Payment History
router.get("/history", history);

// Payment Balance & History
router.get("/balanceHistory", balanceHistory);

module.exports = router;
