const mongoose = require("mongoose");

// Transaction Model
const transactionSchema = new mongoose.Schema({
  from: { type: mongoose.ObjectId, ref: "Passengers", required: true }, // Object Data of sender
  fromNamed: { type: String }, //Requesting User's name
  to: { type: mongoose.ObjectId, ref: "Passengers", required: true }, // Object Data of receiver
  date: { type: Date, default: Date.now, required: true }, // Date of request
  status: { type: String }, // Object Data of status
  amount: { type: Number }
});
const Transactions = mongoose.model("Transactions", transactionSchema);

module.exports.Transactions = Transactions;
