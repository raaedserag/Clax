// Models
const { Passengers } = require("../models/passengers-model");
const { Payments } = require("../models/payment-model");

// Functions
// Retreive user balance
module.exports.getPassengerBalance = async function(userId) {
  const user = await Passengers.findById(userId).select("-_id balance");
  if (!user) throw new Error("User not found");
  return user.balance;
};
module.exports.registerPayment = async function(paymentObject) {
  return await Payments.create(paymentObject);
};

// Update user balance
module.exports.chargePassengerBalance = async function(userId, amount) {
  const userUpdate = await Passengers.findByIdAndUpdate(userId, {
    $inc: { balance: amount }
  });
  userUpdate.balance;
};
