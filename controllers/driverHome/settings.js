//Models
const { Drivers } = require("../../models/drivers-model");
const { PastTrips } =  require('../../models/past-trips-model');
const { Cars } =  require('../../models/cars-model');

//Helpers
const { validateUpdateMe } = require("../../validators/settings-validator");
const { encodeId, hashing } = require("../../helpers/encryption-helper");

  // Get avarege rate and driver info
  module.exports.getDriver = async (req,res) => {

    let rate = await PastTrips.find({
      _driver: req.user._id,
    }).select("-_id rate ");

    rate = JSON.parse(JSON.stringify(rate));
    function averageRate(list) {
      let sum = 0;
      let rateCount = 0;
      for (let i = 0; i < list.length; i++) {
          sum += list[i].rate;
          rateCount++;
      }
      if (rateCount == 0) {
        return 0; 
      }
      let avg = sum / rateCount;
        return avg;
    }   
    
    const data = await Drivers.findById(req.user._id).select(
        "-_id name rate status.is_available phone profilePic tripsCount"
    );

    let avg = averageRate(rate);
    let info = {
      avg : avg.toString(),
      data
    }

    await Drivers.findByIdAndUpdate(req.user._id, {
      rate: avg.toString(),
    });
    return res.send(info);
  };

  // update the driver info
  module.exports.updateDriver = async (req, res) => {
    
    // Validate update request
    const { error, value } = validateUpdateMe(req.body);
    if (error) return res.status(404).send(error.details[0].message);
    let request = value;

    // Format update request
    if (request.mail) request.mail_verified = false;
    if (request.phone) request.phone_verified = false;
    if (request.pass) request.pass = await hashing(request.pass);

    if (request.firstName) {
      let name = {};
      name.first = request.firstName;
      name.last = request.lastName;
      delete request.lastName;
      delete request.firstName;
      request.name = name;
    }

    await Drivers.findByIdAndUpdate('5ee2490b9b6b5f4018c75f82', request);
    console.log(request)
    return res.sendStatus(200);
  };

  //Add car
  module.exports.addCar = async (req, res) => {
    let isExisted = await Cars.findOne({ plateNumber: req.body.plateNumber });
    if (!isExisted){
      //Add 
      let newCar={
      plateNumber: req.body.plateNumber,
      color: req.body.color,
      license: {
        copy: req.body.license.copy,
        ownerName : req.body.license.ownerName,
        vin: req.body.license.vin,
        released:req.body.license.released,
        checking:req.body.license.checking,
        expires:req.body.license.expires
      },
      _line: "5e716d485797b82358227805"
      }
      newCar = await Cars.create(newCar);
      let car = {
        _cars : newCar._id
      };
      await Drivers.update({_id: "5ee2490b9b6b5f4018c75f82"}, {$push: car});
    }

    let car = {
      _cars : isExisted._id
    }
    
    await Drivers.update({_id: "5ee2490b9b6b5f4018c75f82"}, {$push: car});
    return res.sendStatus(200);
  };