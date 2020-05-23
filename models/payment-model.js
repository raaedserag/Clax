const mongoose = require("mongoose");

// Transaction Model
const paymentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["Charge", "Pay", "Punishment", "Borrow", "Lend"],
  }, // Object Data of sender
  date: { type: Date, default: Date.now, required: true }, // Object Data of receiver
  description: { type: String }, // Object Data of status
  amount: { type: Number, required: true },
  _passenger: { type: mongoose.ObjectId, ref: "Passengers", required: true },
});
module.exports.Payments = mongoose.model("Payments", paymentSchema);
