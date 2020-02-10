const mongoose = require("mongoose");

// Complains Model
const complainSchema = new mongoose.Schema({
    text: {type: String},
    date: {type: Date},
    from_passenger: {type: Boolean},    // true means: complain from passenger about a driver, vice versa
    _trip: {type: mongoose.ObjectId, ref: 'PastTrips'},
    status: {type: String, 
        enum: ['pending', 'taken', 'resolved'], 
        default: 'pending'
        },
    
});
const Complains = mongoose.model("Complains", complainSchema);

module.exports.Complains = Complains;
