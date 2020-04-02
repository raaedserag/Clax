// Modules
const router = require("express").Router();
// Controllers
const { getUserPayments,
    getBalance,
    getCardInfo,
    addNewCard,
    removeCard,
    chargeBlance } = require("../../controllers/payment/payment");
//-------------------------------------------------------------------------

//Get user payments
router.get("/", getUserPayments);

// Get balance
router.get("/get-balance", getBalance);

// Get card info
router.get("/get-cards", getCardInfo);

// Add a new card
router.post("/add-card", addNewCard);

// Removed a new card
router.post("/remove-card", removeCard);

// Charge balance
router.post("/charge-balance", chargeBlance);

module.exports = router;
