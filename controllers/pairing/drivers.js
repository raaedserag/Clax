const { Drivers} = require('../../models/drivers-model');
const {Lines} = require('../../models/lines-model');
const {ObjectId} = require('mongodb');
let u_driver;

let drivers = async(req, res) => {
// let driver = new Drivers({ 
//    name:{
//      first:req.body.first,
//      last:req.body.last  },

//    mail:req.body.mail,

//    pass:req.body.pass,

//    phone: req.body.phone, 

//    status: {
//     is_available:req.body.available,
//     availableSeats:req.body.seats,
//     _activeLine: req.body.lineid

// }
// });
// console.log(driver);
// driver.save();
// res.send("ok")
  
  const line =req.body.lineid;
  const seats = req.body.seats;
  const driver= await (await Drivers.findOne( {'status._activeLine':line,'status.is_available':true,'status.availableSeats': { $gte: seats } }));
    if(!driver) return res.status(404).send('no driver is  available');
    u_driver=[driver.name,driver.phone];
    console.log(u_driver);
    res.send(u_driver);
};
  module.exports.drivers=drivers;