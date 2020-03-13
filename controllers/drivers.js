const { Drivers} = require('../models/drivers-model');
let u_driver;

let drivers = async(req, res) => {

    let selectedLine= new Drivers({
            line:req.body.line
          });
    const y_line= selectedLine.line;
    console.log(y_line);
 

    
    const driver= await Drivers.findOne(  {"line": y_line ,'status.is_available': true } );
    if(!driver) return res.status(404).send('no driver is  available');
    u_driver=[driver.name,driver.phone,driver.status.car_no,];
    console.log(u_driver);


  };
  
  
  module.exports.drivers=drivers;