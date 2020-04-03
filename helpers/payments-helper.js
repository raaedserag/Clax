// Modules
const _ = require("lodash");
// DB
const { startTransaction } = require("../db/db");
// Models
const { Passengers } = require("../models/passengers-model");
const { Payments } = require("../models/payment-model");
const { Transactions } = require("../models/transactions-model");

// Functions
// Retreive user balance
module.exports.getPassengerBalance = async function (userId) {
  const user = await Passengers.findById(userId).select("-_id balance").lean();
  if (!user) throw new Error("User not found");
  return user.balance;
};

// Update user balance
module.exports.chargePassengerBalance = async function (userId, request) {
  let session = null;
  try {
    // Start Transaction
    await session.startTransaction();
    const payment = await Payments.create([{
      amount: parseFloat(request.amount),
      _passenger: userId,
      description: request.source,
      type: "Charge"
    }], { session }).lean();

    await Passengers.findByIdAndUpdate(userId, {
      $inc: { balance: request.amount },
      $push: { _payments: payment._id }
    }).lean();

    // All Is well
    await session.commitTransaction();
    return _.map(
      loanerPayment,
      _.partialRight(_.pick, ["amount", "description", "type", "date"])
    )[0];

  } catch (error) {
    await session.abortTransaction();
    throw new Error("Transaction Failed !\n" + error.message);
  }
};

// Transfer Money between users
module.exports.transferMoney = async function (transferRequest, req) {
  let session = null;
  try {
    // Start Transaction Session
    session = await startTransaction();

    // Withdraw balance from loaner
    let loaner = await Passengers.findByIdAndUpdate(
      transferRequest.loaner,
      {
        $inc: { balance: -parseFloat(transferRequest.amount) }
      },
      { session }
    ).select("-_id balance").lean();
    if (!loaner) throw new Error("Loaner Not Found !");

    // Register loaner payment
    let loanerPayment = await Payments.create(
      [
        {
          amount: parseFloat(transferRequest.amount),
          _passenger: transferRequest.loaner,
          description: req.body.loanerNamed,
          type: "Lend",
          date: Date.now()
        }
      ],
      { session }
    );

    await Passengers.updateOne(
      { _id: transferRequest.loaner },
      { $push: { _payments: loanerPayment._id } },
      { session }
    );

    // Deposite balance to receiver
    const loanee = await Passengers.findByIdAndUpdate(
      transferRequest.loanee,
      {
        $inc: { balance: +parseFloat(transferRequest.amount) }
      },
      { session }
    ).select("-_id balance").lean();
    if (!loanee) throw new Error("Receiver Not Found !");

    // Register receiver payment
    let loaneePayment = await Payments.create(
      [
        {
          amount: parseFloat(transferRequest.amount),
          _passenger: transferRequest.loanee,
          description: req.body.loaneeNamed,
          type: "Borrow",
          date: Date.now()
        }
      ],
      { session }
    );

    await Passengers.updateOne(
      { _id: transferRequest.loanee },
      { $push: { _payments: loaneePayment._id } },
      { session }
    );

    // Removing Database Transaction
    await Transactions.findByIdAndRemove(transferRequest._id, { session });

    // Commit Transaction and return sender balance
    await session.commitTransaction();
    return _.map(
      loanerPayment,
      _.partialRight(_.pick, ["amount", "description", "type", "date"])
    )[0];
  } catch (error) {
    await session.abortTransaction();
    throw new Error("Transaction Failed !\n" + error.message);
  }
};

