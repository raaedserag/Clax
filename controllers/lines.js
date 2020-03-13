const {Lines} = require('../models/lines-model');



 let lines = async(req, res) => {
  console.log("line:")
  
  let oneLine= new Lines({
    id: req.body.id,
    from: req.body.from,
    to: req.body.to,
    direction: req.body.direction,
    cost: req.body.cost,
    _stations: req.body.stations
   
      });
    line= await oneLine.save();  
    console.log(req.body)
    res.send('yes');
};


module.exports.lines=lines;