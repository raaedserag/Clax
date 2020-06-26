const mongoose = require("mongoose");

// Transaction Model
const paymentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ["Charge", "Pay", "Punish-Driver", "Punish-Passenger", "Borrow", "Lend"],
  }, // Object Data of sender
  date: { type: Date, default: Date.now, required: true }, // Object Data of receiver
  description: { type: String }, // Object Data of status
  amount: { type: Number, required: true },
  _passenger: { type: mongoose.ObjectId, ref: "Passengers", required: true },
  _driver: { type: mongoose.ObjectId, ref: "Passengers" },
});
module.exports.Payments = mongoose.model("Payments", paymentSchema);
