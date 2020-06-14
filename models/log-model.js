const mongoose = require("mongoose");

// log Model
const logSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
  },
  level: {
    type: String,
  },
  message: { type: String },
  meta: { type: String },
});
module.exports.Log = mongoose.model("Log", logSchema);
