// Modules
const router = require("express").Router();
// Controllers
const { getUserPayments,
    getBalance,
    getCardInfo,
    addNewCard,
    removeCard,
    chargeBlance } = require("../../controllers/payment/manage-financials-controller");
//-------------------------------------------------------------------------

//Get user payments
router.get("/", getUserPayments);

// Get balance
router.get("/get-balance", getBalance);

// Get card infoذ
router.get("/get-cards", getCardInfo);

// Add a new card
router.post("/add-card", addNewCard);

// Removed a new card
router.post("/remove-card", removeCard);

// Charge balance
router.post("/charge-credit", chargeBlance);

module.exports = router;
