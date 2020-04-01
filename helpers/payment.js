// Models
const { Passengers } = require("../models/passengers-model");
const { Payment } = require("../models/payment-model");


// Functions
// Retreive user balance
module.exports.getPassengerBalance = async function (userId) {

  const user = await Passengers.findById(userId).select("-_id balance");
  if (!user) throw new Error("User not found");
  return user.balance;
};

module.exports.registerPayment = async function (payment) {

  await Payment.create(payment);
};

// Update user balance
module.exports.chargePassengerBalance = async function (userId, amount) {

  const userUpdate = await Passengers.findByIdAndUpdate(userId, {
    $inc: { balance: amount }
  });
  userUpdate.balance;
};
