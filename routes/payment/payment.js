// Modules
const router = require("express").Router();
const _ = require("lodash");
// Controllers
const paymentController = require("../../controllers/payment/payment");
const stripeController = require("../../controllers/payment/stripe");
//-------------------------------------------------------------------------

// Get balance
router.post("/get-balance", async (req, res) => {
  const userQuery = await paymentController.getUserBalance(req.body.id);

  // If failed due to server error
  if (!userQuery.success) return res.status(500).send("Failed to implement");

  // If query success, but found no user with this user id
  if (userQuery.success && !userQuery.result)
    return res.status(400).send("user not found");

  // IF ALL IS WELLs
  res.status(200).send(userQuery.result);
});

// Get card info
router.post("/get-cards", async (req, res) => {
  // Retrieve stripe account id
  const userObject = await paymentController.getUserStripeId(req.body.id);
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
router.post("/add-card", async (req, res) => {
  // Validate req schema
  //   const { error } = paymentController.validateCard(req.body);
  //   if (error) return res.status(400).send(error.details[0].message);

  // Generate stripe card token, muuuuuust edit this shit.....
  const createCardToken = await stripeController.createCardToken({
    number: req.body.number,
    exp_month: parseInt(req.body.exp_month),
    exp_year: parseInt(req.body.exp_year),
    cvc: req.body.cvc
  });
  // If generating card token failed
  if (!(createCardToken.success && createCardToken.result))
    return res.status(500).send("Failed to implement 1");

  // Retrieve stripe account id
  const userObject = await paymentController.getUserStripeId(req.body.id);
  
  // If retreiving stripe id failed
  if (!(userObject.success && userObject.result.stripeId))
    return res.status(500).send("Failed to implement 2");

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

// Charge balance
router.post("/charge-balance", async (req, res) => {
  // Must be a transaction
  // Validate req schema
  const { error } = paymentController.validateCharge(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  // Retrieve stripe account id
  const userObject = await paymentController.getUserStripeId(req.body.id);
  // console.log(userObject.result.stripeId);
  // Creating charge
  const creatingCharge = await stripeController.chargeBalance(
    userObject.result.stripeId,
    req.body.source,
    req.body.amount
  );
  // If creating charge failed
  if (!(creatingCharge.success && creatingCharge.result))
    return res.status(500).send("Failed to implement");

  // Adding balance to the user account
  //
  res.status(200).send({ balance: creatingCharge.result.amount });
});

module.exports = router;
