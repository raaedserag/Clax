// Modules
const Joi = require("@hapi/joi");

// Models
const { Passengers } = require("../../models/passengers-model");
const { Payment } = require("../../models/payment-model");
// Setup Error Debugger
const paymentDebugger = require("debug")("Clax:paymentDebugger");

// Functions
// Retreive user balance
module.exports.getUserBalance = async function(userId) {

  const user = await Passengers.findById(userId).select("-_id balance");
  return user.balance

};

module.exports.registerPayment = async function(payment) {
  return await Payment.create(payment)
};

// Update user balance
module.exports.updateUserBalance = async function(userId, amount) {
  const userUpdate = await Passengers.findByIdAndUpdate(userId, {
    $inc: { balance: amount }
  });
  return userUpdate.balance
};
