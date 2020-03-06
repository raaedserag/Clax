const router = require("express").Router();

const {
  registerCard,
  currentBalance,
  transferMoney
} = require("../controllers/transactions");

router.post("/register", registerCard);
router.get("/balance", currentBalance);
router.post("/transfer", transferMoney);

module.exports = router;
