const mongoose = require("mongoose");

// Car Model
const carSchema = new mongoose.Schema({
    color: {type: String},   
    plateNumber: {type: String},    // Car Number (Common usage to identify car)
    license:{
        copy: {data: Buffer, contentType: String},
        ownerName: {type: String},
        vin: {type: String},            // Vehicle Identification Number (Only for security)
        released: {type: Date},
        checking: {type: Date},
        expires: {type: Date}
    }
});

const Cars = mongoose.model("Cars", carSchema);

module.exports.Cars = Cars;
