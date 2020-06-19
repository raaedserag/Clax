// Modules
const _ = require("lodash");
// DB
const { startTransaction } = require("../db/db");
// Models
const { Passengers } = require("../models/passengers-model");
const { Drivers } = require("../models/drivers-model")
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
    session = await startTransaction();
    const payment = await Payments.create([{
      amount: parseFloat(request.amount),
      _passenger: userId,
      description: request.source,
      type: "Charge"
    }], { session });

    await Passengers.findByIdAndUpdate(userId, {
      $inc: { balance: request.amount },
      $push: { _payments: payment._id }
    }, { session }).lean();

    // All Is well
    await session.commitTransaction();
    return _.map(
      payment,
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

// Pay from passenger to driver (type=0) and vice versa (type = 1)
module.exports.payPunishment = async function (transferRequest, type = 0) {
  let session, Source, Destination, payType;
  if (type == 0) {
    transferRequest.passenger = transferRequest.source
    transferRequest.driver = transferRequest.destination
    Source = Passengers;
    Destination = Drivers;
    payType = "Punish-Passenger";
  }
  else {
    transferRequest.passenger = transferRequest.destination
    transferRequest.driver = transferRequest.source
    Source = Drivers;
    Destination = Passengers;
    payType = "Punish-Driver"
  }
  try {
    // Start Transaction Session
    session = await startTransaction();

    // Withdraw balance from source
    const sender = await Source.findByIdAndUpdate(
      transferRequest.source,
      {
        $inc: { balance: -parseFloat(transferRequest.amount) }
      },
      { session }
    ).select("-_id balance");
    if (!sender) throw new Error("Sender Not Found !");

    // Deposite balance to receiver
    const receiver = await Destination.findByIdAndUpdate(
      transferRequest.destination,
      {
        $inc: { balance: +parseFloat(transferRequest.amount) }
      },
      { session }
    ).select("-_id balance")
    if (!receiver) throw new Error("Receiver Not Found !");

    // Register payment
    const payment = await Payments.create(
      [
        {
          amount: parseFloat(transferRequest.amount),
          _passenger: transferRequest.passenger,
          _driver: transferRequest.driver,
          description: transferRequest.description,
          type: payType,
          date: Date.now()
        }
      ],
      { session });
    // Pushing Payment to the source and destination
    await Source.updateOne(
      { _id: transferRequest.source },
      { $push: { _payments: payment._id } },
      { session }
    );
    await Destination.updateOne(
      { _id: transferRequest.destination },
      { $push: { _payments: payment._id } },
      { session }
    );

    // Commit Transaction and return sender balance
    await session.commitTransaction();
    return _.map(
      payment,
      _.partialRight(_.pick, ["amount", "description", "type", "date"])
    )[0];
  } catch (error) {
    await session.abortTransaction();
    throw new Error("Transaction Failed !\n" + error.message);
  }
};