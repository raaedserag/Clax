const mongoose = require("mongoose");

// Transaction Model
const transactionSchema = new mongoose.Schema({
  from: { type: mongoose.ObjectId, ref: "Passengers", required: true }, // Object Data of sender
  to: { type: mongoose.ObjectId, ref: "Passengers", required: true }, // Object Data of receiver
  status: { type: String }, // Object Data of status
  amount: { type: Number },
  date: { type: Date, default: Date.now, required: true } // Date of request
});
const Transactions = mongoose.model("Transactions", transactionSchema);

module.exports.Transactions = Transactions;
