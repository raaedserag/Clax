// Modules
const router = require("express").Router();
const _ = require("lodash");
// Controllers
const paymentHelper= require("../../helpers/payment");
const paymentValidators = require("../../validators/payment-validators");
const transactionValidators = require("../../validators/transaction-validators");
const transactionsController = require("../../controllers/payment/transactions");
const stripeController = require("../../controllers/payment/stripe");
//-------------------------------------------------------------------------




// Get balance
module.exports.getBalance = async (req, res) => {
  const userQuery = await paymentHelper.getUserBalance(req.passenger._id);

  // If failed due to server error
  if (!userQuery.success) return res.status(500).send("Failed to implement");

  // If query success, but found no user with this user id
  if (userQuery.success && !userQuery.result)
    return res.status(400).send("user not found");

  // IF ALL IS WELLs
  res.status(200).send(Number.parseFloat(userQuery.result.balance).toFixed(2));

};

// Get card info
module.exports.getCardInfo = async (req, res) => {
  // Retrieve stripe account id
  const userObject = await paymentHelper.getUserStripeId(req.passenger._id);
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
};

// Add a new card
module.exports.addNewCard =  async (req, res) => {
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
  const userObject = await paymentHelper.getUserStripeId(req.body.id);
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
};


// Removed a new card
module.exports.removeCard =  async (req, res) => {
  // Retrieve stripe account id
  const userObject = await paymentHelper.getUserStripeId(req.body.id);
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
};


// Charge balance
module.exports.chargeBlance =async (req, res) => {
  // Must be a transaction
  // Validate req schema
  const { error } = paymentValidators.validateCharge(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Retrieve stripe account id
  const userObject = await paymentHelper.getUserStripeId(req.body.id);
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
  const updatingBalance = await paymentHelper.updateUserBalance(
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
};



//Get user payments
module.exports.getUserPayments = async (req, res) => {
  try {
      var payment = await Passengers.findById(req.passenger._id)
      .select("-_id name")
      .populate({
        path: "_payments",
        select: " amount description type date"
      });


    //take only payment from passenger opject
     payment = JsonFind(payment);
     payment= payment.checkKey('_payments');
     res.send(payment);
  } catch (error) {
    paymentDebugger(error.message);
    return { success: false, result: error.message };
  }
};

