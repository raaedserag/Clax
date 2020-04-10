// Modules
const _ = require("lodash");
// Models
const { Passengers } = require("../../models/passengers-model");
// Helpers and Services
const {
  getPassengerBalance,
  chargePassengerBalance
} = require("../../helpers/payments-helper");
const {
  getCards,
  createCardToken,
  createSource,
  removeSource,
  chargeStripeBalance
} = require("../../services/stripe");
// Validators
const {
  validateCard,
  validateChargeRequest
} = require("../../validators/manage-financials-validators");
//-------------------------------------------------------------------------

// Get balance
module.exports.getBalance = async (req, res) => {
  const userBalance = await getPassengerBalance(req.user._id);
  res.status(200).send(parseFloat(userBalance).toFixed(2));
};

// Charge balance
module.exports.chargeBlance = async (req, res) => {
  // Validate req schema
  const { error } = validateChargeRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Charge passenger stripe account
  await chargeStripeBalance(
    req.user.stripeId,
    req.body
  );
  // Adding balance to the passenger account
  const payment = await chargePassengerBalance(req.user._id, req.body);

  // Registering charge operation

  // IF ALL IS WELL
  return res.send(payment);
};

// Get card info
module.exports.getCardInfo = async (req, res) => {
  // Retreive cards info
  const cardsQuery = await getCards(req.user.stripeId);
  res
    .status(200)
    .send(
      _.map(
        cardsQuery.data,
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
module.exports.addNewCard = async (req, res) => {
  // Validate req schema
  const { error } = validateCard(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Generate stripe card token, muuuuuust edit this shit.....
  const cardTokenId = await createCardToken({
    number: req.body.number,
    exp_month: parseInt(req.body.exp_month),
    exp_year: parseInt(req.body.exp_year),
    cvc: req.body.cvc
  });

  // Generating user card source
  const sourceTokenId = await createSource(req.user.stripeId, cardTokenId);

  return res.status(200).send(sourceTokenId);
};

// Removed a new card
module.exports.removeCard = async (req, res) => {
  await removeSource(req.user.stripeId, req.body.source);
  return res.status(200).send("Source removed successfully!");
};

//Get user payments
module.exports.getUserPayments = async (req, res) => {
  var payments = await Passengers.findById(req.user._id)
    .select("-_id name")
    .populate({
      path: "_payments",
      select: "-_id amount description type date loaneeName"
    }).lean();
  res.send(payments._payments);
};
