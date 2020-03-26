// Modules
const router = require("express").Router();
const _ = require("lodash");
//Middlewares
const authrization=require("../../middlewares/authentication");
// Controllers
const paymentValidators = require("../../validators/payment-validators");
const transactionValidators = require("../../validators/transaction-validators");
const transactionsController = require("../../controllers/payment/transactions");
const paymentController = require("../../controllers/payment/payment");
const stripeController = require("../../controllers/payment/stripe");
//-------------------------------------------------------------------------
//Get user payments
router.get("/",authrization, paymentController.getUserPayments);

// Get balance
router.get("/get-balance",authrization, async (req, res) => {
  const userQuery = await paymentController.getUserBalance(req.passenger._id);

  // If failed due to server error
  if (!userQuery.success) return res.status(500).send("Failed to implement");

  // If query success, but found no user with this user id
  if (userQuery.success && !userQuery.result)
    return res.status(400).send("user not found");

  // IF ALL IS WELLs
  res.status(200).send(Number.parseFloat(userQuery.result.balance).toFixed(2));
});

// Get card info
router.get("/get-cards", authrization,async (req, res) => {
  // Retrieve stripe account id
  const userObject = await paymentController.getUserStripeId(req.passenger._id);
  // If retreiving stripe id failed
  if (!(userObject.success && userObject.result))
    return res.status(500).send("Failed to implement");

  // Retreive cards info
  const cardsQuery = await stripeController.getCards(
    userObject.result.stripeId
  );
  // If retreiving cards failed
  if (!(cardsQuery.success && cardsQuery.result))
    return res.status(500).send("Failed to implement");

  // IF ALL IS WELL
  res
    .status(200)
    .send(
      _.map(
        cardsQuery.result.data,
        _.partialRight(_.pick, [
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
router.post("/add-card",authrization, async (req, res) => {
  // Validate req schema
  const { error } = paymentValidators.validateCard(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Generate stripe card token, muuuuuust edit this shit.....
  const createCardToken = await stripeController.createCardToken({
    number: req.body.number,
    exp_month: parseInt(req.body.exp_month),
    exp_year: parseInt(req.body.exp_year),
    cvc: req.body.cvc
  });
  // If generating card token failed
  if (!(createCardToken.success && createCardToken.result))
    return res.status(500).send("Failed to implement");

  // Retrieve stripe account id
  const userObject = await paymentController.getUserStripeId(req.body.id);
  // If retreiving stripe id failed
  if (!(userObject.success && userObject.result))
    return res.status(500).send("Failed to implement");

  // Generating user card source
  const createSourceToken = await stripeController.createSource(
    userObject.result.stripeId,
    createCardToken.result.id
  );

  // If generating source failed
  if (!(createSourceToken.success && createSourceToken.result))
    return res
      .status(500)
      .send("Failed to implement 3" + createSourceToken.result);

  // IF ALL IS WELL
  return res.status(200).send(createSourceToken.result.id);
});

// Removed a new card
router.post("/remove-card",authrization, async (req, res) => {
  // Retrieve stripe account id
  const userObject = await paymentController.getUserStripeId(req.body.id);
  // If retreiving stripe id failed
  if (!(userObject.success && userObject.result))
    return res
      .status(500)
      .send(`Failed to get getUserStripeId of ${req.body.id}`);
  // Generating user card source
  const removedSource = await stripeController.removeSource(
    userObject.result.stripeId,
    req.body.source
    // "card_1GOHn9FRbrLkbntUE68tSytY"
  );

  // If generating source failed
  if (!(removedSource.success && removedSource.result))
    return res
      .status(500)
      .send(
        `Failed to remove srouce ${req.body.source}` + removedSource.result
      );

  // IF ALL IS WELL
  return res.status(200).send("Source removed successfully!");
});

// Charge balance
router.post("/charge-balance",authrization, async (req, res) => {
  // Must be a transaction
  // Validate req schema
  const { error } = paymentValidators.validateCharge(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Retrieve stripe account id
  const userObject = await paymentController.getUserStripeId(req.body.id);
  // If retreiving stripe id failed
  if (!(userObject.success && userObject.result))
    throw new Error(userObject.result);

  req.body.customerStripeId = userObject.result.stripeId;

  // Creating charge
  const creatingCharge = await stripeController.chargeBalance(req.body);
  // If creating charge failed
  if (!(creatingCharge.success && creatingCharge.result))
    throw new Error(userObject.result);

  // Adding balance to the user account
  const updatingBalance = await paymentController.updateUserBalance(
    req.body.id,
    req.body.amount,
    req.body.source
  );
  // If updating failed
  if (!(updatingBalance.success && updatingBalance.result))
    throw new Error(userObject.result);

  const payment = {
    amount: parseFloat(req.body.amount),
    _passenger: req.body.id,
    description: req.body.source,
    type: "Charge"
  };
  let { error2 } = paymentValidators.validatePayment(payment);
  if (error2) return res.status(400).send(error2.details[0].message);

  const addPayment = await paymentController.registerPayment(payment);
  if (!(addPayment.result && addPayment.success))
    throw new Error(addPayment.result);

  // IF ALL IS WELL
  return res
    .status(200)
    .send({ balance: Number.parseFloat(creatingCharge.result).toFixed(2) });
});

module.exports = router;
