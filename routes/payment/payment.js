// Modules
const router = require("express").Router();
const _ = require("lodash");
// Controllers
const {validateCard, 
  validateCharge, 
  validatePayment} = require("../../validators/payment-validators");

const {getUserBalance, 
  registerPayment, 
  updateUserBalance} = require("../../controllers/payment/payment");

const {getCards, 
createCardToken, 
createSource, 
removeSource, 
chargeBalance} = require("../../controllers/payment/stripe");

//-------------------------------------------------------------------------

// Get balance
router.get("/get-balance", async (req, res) => {
  const userBalance = await getUserBalance(req.passenger._id);
  res.send(Number.parseFloat(userBalance).toFixed(2));
});

// Get card info
router.get("/get-cards", async (req, res) => {
  // Retreive cards info
  const cardsQuery = getCards(
     req.passenger.stripeId
  );

  res.send(_.map(cardsQuery.data,_.partialRight(_.pick, [
          "id",
          "exp_year",
          "exp_month",
          "last4",
          "brand"
        ])
      )
    );
});

// Add a new card
router.post("/add-card", async (req, res) => {
  // Validate req schema
  const { error, value } = validateCard(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Generate stripe card token
  const cardToken = await createCardToken(value);
  
  // Generating user card source
  const sourceToken = await createSource(
    req.passenger.stripeId,
    cardToken.id
  );

  // IF ALL IS WELL
  return res.send(sourceToken.id);
});

// Removed a new card
router.post("/remove-card", async (req, res) => {
  // Remove user card source
  await removeSource(
    req.passenger.stripeId,
    req.body.source
  );

  // IF ALL IS WELL
  return res.send("Source removed successfully!");
});

// Charge balance
router.post("/charge-balance", async (req, res) => {
  // Must be a transaction
  // Validate req schema
  let { error, value} = validateCharge(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Assigning stripe id 
  value.customerStripeId = req.passenger.stripeId;

  // Creating charge
  const chargedBalance = await chargeBalance(value);

  // Adding balance to the user account
  await updateUserBalance(
    req.passenger._id,
    value.amount
  );


  const payment = {
    amount: value.amount,
    _passenger: req.passenger._id,
    description: value.source,
    type: "Charge"
  };

  let { error, value } = validatePayment(payment);
  if (error) return res.status(400).send(error2.details[0].message);

   await registerPayment(payment);

  // IF ALL IS WELL
  return res.send({ balance: Number.parseFloat(chargedBalance).toFixed(2) });
});

module.exports = router;

// router.put("/cancel-transfer", cancelFamilyRequest);
// router.get("/fetch-transfers", fetchRequests);
// router.put("/accept-transfer", acceptRequest);
// router.put("/deny-transfer", denyRequest);
