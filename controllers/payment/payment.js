// Modules
const _ = require("lodash");
// Helpers and Services
const { getPassengerBalance,
  chargePassengerBalance,
  registerPayment } = require("../../helpers/payment");
const stripeHelper = require("../../services/stripe");
// Validators
const { validateCard,
  validateCharge } = require("../../validators/payment-validators");
//-------------------------------------------------------------------------


// Get balance
module.exports.getBalance = async (req, res) => {
  const userBalance = await getPassengerBalance(req.passenger._id);
  res.status(200).send(parseFloat(userBalance).toFixed(2));
};

// Get card info
module.exports.getCardInfo = async (req, res) => {
  // Retreive cards info
  const cardsQuery = await stripeHelper.getCards(req.passenger.stripeId);
  res.status(200).send(_.map(cardsQuery.data, _.partialRight(_.pick, [
    "id",
    "exp_year",
    "exp_month",
    "last4",
    "brand"])));
};

// Add a new card
module.exports.addNewCard = async (req, res) => {
  // Validate req schema
  const { error } = validateCard(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Generate stripe card token, muuuuuust edit this shit.....
  const cardTokenId = await stripeHelper.createCardToken({
    number: req.body.number,
    exp_month: parseInt(req.body.exp_month),
    exp_year: parseInt(req.body.exp_year),
    cvc: req.body.cvc
  });

  // Generating user card source
  const sourceTokenId = await stripeHelper.createSource(
    req.passenger.stripeId,
    cardTokenId
  );

  return res.status(200).send(sourceTokenId);
};

// Removed a new card
module.exports.removeCard = async (req, res) => {
  await stripeHelper.removeSource(req.passenger.stripeId, req.body.source);
  return res.status(200).send("Source removed successfully!");
};

// Charge balance
module.exports.chargeBlance = async (req, res) => {
  // Validate req schema
  const { error } = validateCharge(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Charge passenger stripe account 
  const chargedBalance = await stripeHelper.chargeStripeBalance(req.passenger.stripeId, req.body);
  // Adding balance to the passenger account
  await chargePassengerBalance(req.passenger._id, req.body.amount);

  // Registering charge operation
  await registerPayment({
    amount: parseFloat(req.body.amount),
    _passenger: req.passenger._id,
    description: req.body.source,
    type: "Charge"
  });

  // IF ALL IS WELL
  return res.send({ balance: parseFloat(chargedBalance).toFixed(2) });
};

//Get user payments
module.exports.getUserPayments = async (req, res) => {
  var payments = await Passengers.findById(req.passenger._id)
    .select("-_id name")
    .populate({
      path: "_payments",
      select: "amount description type date"
    });
  res.send(_.map(payments, _.pick, ["_payments"]));
}
