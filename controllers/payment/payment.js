// Modules
const Joi = require("@hapi/joi");
// Controllers
const stripeController = require('./stripe')
// Models
const Passengers = require("../../models/passengers-model").Passengers;
// Setup Error Debugger
const paymentDebugger = require("debug")("app:paymentDebugger");

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

// Retreive user stripe id 
module.exports.getUserStripeId = async function(userId) {
  try {
    const user = await Passengers.findById(userId).select("-_id stripeId");
    // Check if user id is null
    if (!user.stripeId) {
      paymentDebugger('This user have no stripe account');
      return { success: false, result: 'This user have no stripe account' };
    }

    return { success: true, result: user };
  } catch (error) {
    paymentDebugger(error.message);
    return { success: false, result: error.message };
  }
};

// Transfer Money between users
module.exports.transferMoney = async function(transfer){
  try {
    let transaction

    // Update sender stripe account
    transaction.sender = await stripeController.updateCustomer(
      transfer.senderStripeId,
      {balance: - (parseFloat(transfer.amount))}
    );
    
    // Update receiver stripe account
    transaction.receiver = await stripeController.updateCustomer(
      transfer.receiverStripeId,
      {balance: parseFloat(transfer.amount)}
    );

    return {success: true, result: transaction}
  } 
  catch (error) {
    paymentDebugger(error.message);
    return { success: false, result: error.message };
  }
  
}
