// Modules
const Joi = require("@hapi/joi");
// Controllers
const stripeController = require("./stripe");
// Models
const Passengers = require("../../models/passengers-model").Passengers;
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

// Update user balance
module.exports.updateUserBalance = async function(userId, amount) {
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

// Transfer Money between users
module.exports.transferMoney = async function(transfer) {
  try {
    // Update sender database balance
    const sender = await Passengers.findByIdAndUpdate(transfer.id, {
      $inc: { balance: -transfer.amount }
    }).select("-_id balance");

    // Update receiver database balance
    const receiver = await Passengers.findByIdAndUpdate(transfer.receiverId, {
      $inc: { balance: transfer.amount }
    }).select("-_id balance");

    // Update sender stripe account
    await stripeController.updateCustomer(transfer.senderStripeId, {
      balance: sender.balance - parseFloat(transfer.amount)
    });

    // Update receiver stripe account
    await stripeController.updateCustomer(transfer.receiverStripeId, {
      balance: receiver.balance + parseFloat(transfer.amount)
    });

    // return esult
    return { success: true, result: sender.balance };
  } catch (error) {
    paymentDebugger(error.message);
    return { success: false, result: error.message };
  }
};
