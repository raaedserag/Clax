const mongoose = require("mongoose");

// Lines Model
const lineSchema = new mongoose.Schema({
    from: {type: String},
    to: {type: String},
    direction: {type: Boolean},
    cost: {type: Number},
    _stations: [{type: mongoose.ObjectId, ref: 'Stations'}]
});
const Lines = mongoose.model("Lines", lineSchema);

module.exports.Lines = Lines;
