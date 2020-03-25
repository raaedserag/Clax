const transactionDebugger = require("debug")("Clax:transactionDebugger");
// Models
const { Passengers } = require("../../models/passengers-model");
const { Transactions } = require("../../models/transactions-model");
// Controllers
const stripeController = require("./stripe");

// Retreive User by number
module.exports.getUserbyNumber = async function(number) {
  try {
    let user = await Passengers.findOne({ phone: number }).select("_id name");
    if (user == null) user = { _id: false };
    return { success: true, result: user };
  } catch (error) {
    transactionDebugger(error.message);
    return { success: false, result: error.message };
  }
};

// Cancel request to Database
module.exports.cencelReqeust = async function(body) {
  try {
    if (body.type == "loanee") {
      let cancel = await Transactions.findOneAndRemove({
        from: body.id,
        _id: body.transactionId
      });
      return { success: true, result: cancel };
    } else {
      let cancel = await Transactions.findOneAndRemove({
        to: body.id,
        _id: body.transactionId
      });
      return { success: true, result: cancel };
    }
  } catch (error) {
    transactionDebugger(error.message);
    return { success: false, result: error.message };
  }
};
module.exports.fetchRequests = async function(id) {
  try {
    let result = await Transactions.find({
      to: id
    });
    return { success: true, result: result };
  } catch (error) {
    transactionDebugger(error.message);
    return { success: false, result: error.message };
  }
};
// Accept request to Database
module.exports.acceptReqeust = async function(data) {
  try {
    let request = await Transactions.findOne({
      to: data.id,
      _id: data.transactionId
    });
    return { success: true, result: request };
  } catch (error) {
    transactionDebugger(error.message);
    return { success: false, result: error.message };
  }
};

// Add request to Database
module.exports.registerReqeust = async function(transfer) {
  try {
    await new Transactions(transfer).save();
    return { success: true, result: true };
  } catch (error) {
    return { success: true, result: error.message };
  }
};
// Transfer Money between users
module.exports.transferMoney = async function(transfer) {
  try {
    // Update sender database balance
    const sender = await Passengers.findByIdAndUpdate(transfer.id, {
      $inc: { balance: -parseInt(transfer.amount) }
    }).select("-_id balance");
    // Update receiver database balance
    const receiver = await Passengers.findByIdAndUpdate(transfer.receiverId, {
      $inc: { balance: +parseInt(transfer.amount) }
    }).select("-_id balance");
    // Update sender stripe account
    await stripeController.updateCustomer(transfer.senderStripeId, {
      balance: (-parseInt(sender.balance) + parseInt(transfer.amount)) * 100
    });
    // Update receiver stripe account
    await stripeController.updateCustomer(transfer.receiverStripeId, {
      balance: -(parseInt(receiver.balance) + parseInt(transfer.amount)) * 100
    });
    // return esult
    return { success: true, result: sender.balance };
  } catch (error) {
    transactionDebugger(error.message);
    return { success: false, result: error.message };
  }
};
