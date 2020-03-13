const mongoose = require("mongoose");

// Transaction Model
const transactionSchema = new mongoose.Schema({
    from: {type: String},   // Object Data of sender
    to: {type: String},     // Object Data of receiver
    status: {type: String}, // Object Data of status
    amount: {type: Number},
    _passenger: [{type: mongoose.ObjectId, ref: 'Passengers'}]
});
const Transactions = mongoose.model("Transactions", transactionSchema);

module.exports.Transactions = Transactions;