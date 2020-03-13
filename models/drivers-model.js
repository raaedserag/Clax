const mongoose = require("mongoose");

// Driver Model
const driverSchema = new mongoose.Schema({
  name: {type: String},
  mail: {type: String},
  pass: {type: String},
  phone: {type: String},
  rate: {type: Number},
  img: {data: Buffer, contentType: String},
  license: {
      copy: {data: Buffer, contentType: String},
      fullName: {type: String},
      nationalId: {type: String},
      region: {type: String},
      released: {type: Date},
      expires: {type: Date},
  },
  status: {
      is_available: {type: Boolean},
      availableSeats: {type: Number},
      _activeCar: {type: mongoose.ObjectId, ref: 'Cars'}
  }
});
const Drivers = mongoose.model("Drivers", driverSchema);

module.exports.Drivers = Drivers;
