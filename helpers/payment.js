// Modules
const Joi = require("@hapi/joi");
const JsonFind = require('json-find');

// Models
const { Passengers } = require("../models/passengers-model");
const { Payment } = require("../models/payment-model");



// Setup Error Debugger
const paymentDebugger = require("debug")("Clax:paymentDebugger");

// Functions
// Retreive user balance
module.exports.getUserBalance = async function(userId) {
  try {
    const user = await Passengers.findById(userId).select("-_id balance");
    return { success: true, result: user };
  } catch (error) {
    paymentDebugger(error.message);
    return { success: false, result: error.message };
  }
};

module.exports.registerPayment = async function(payment) {
  try {
    await Payment(payment).save();
    return { success: true, result: true };
  } catch (error) {
    return { success: true, result: error.message };
  }
};

// Update user balance
module.exports.updateUserBalance = async function(userId, amount, source) {
  try {
    const userUpdate = await Passengers.findByIdAndUpdate(userId, {
      $inc: { balance: amount }
    });

    return { success: true, result: userUpdate.balance };
  } catch (error) {
    paymentDebugger(error.message);
    return { success: false, result: error.message };
  }
};

// Retreive user stripe id
module.exports.getUserStripeId = async function(userId) {
  try {
    const user = await Passengers.findById(userId).select("-_id stripeId");
    // Check if user id is null
    if (!user.stripeId) {
      paymentDebugger("This user have no stripe account");
      return { success: false, result: "This user have no stripe account" };
    }

    return { success: true, result: user };
  } catch (error) {
    paymentDebugger(error.message);
    return { success: false, result: error.message };
  }
};

