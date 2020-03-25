const mongoose = require("mongoose");

// Transaction Model
const paypalSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    description: { type: String },
    _passenger: { type: mongoose.ObjectId, ref: "Passengers", required: true }
  
    
});
const Paypal = mongoose.model("Paypal", paypalSchema);

module.exports.Paypal = Paypal;