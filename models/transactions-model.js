const mongoose = require("mongoose");

// Transaction Model
const transactionSchema = new mongoose.Schema({
  loanee: { type: mongoose.ObjectId, ref: "Passengers", required: true }, // Object Data of sender
  loaneeNamed: { type: String }, //Requesting User's name
  loaner: { type: mongoose.ObjectId, ref: "Passengers", required: true }, // Object Data of receiver
  date: { type: Date, default: Date.now, required: true }, // Date of request
  status: { type: String }, // Object Data of status
  amount: { type: Number }
});
module.exports.Transactions = mongoose.model("Transactions", transactionSchema);
