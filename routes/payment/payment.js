// Modules
const router = require("express").Router();
const _ = require("lodash");
//Middlewares
const authrization=require("../../middlewares/authentication");
// Controllers

const paymentController = require("../../controllers/payment/payment");

//-------------------------------------------------------------------------
//Get user payments
router.get("/",authrization, paymentController.getUserPayments);

// Get balance
router.get("/get-balance",authrization,paymentController.getBalance);

// Get card info
router.get("/get-cards", authrization,paymentController.getCardInfo);

// Add a new card
router.post("/add-card",authrization,paymentController.addNewCard);

// Removed a new card
router.post("/remove-card",authrization,paymentController.removeCard);

// Charge balance
router.post("/charge-balance",authrization,paymentController.chargeBlance );

module.exports = router;
