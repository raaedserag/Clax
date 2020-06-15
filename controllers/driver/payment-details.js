const { Drivers } = require("../../models/drivers-model");
const { PastTrips } = require("../../models/past-trips-model");
const { getExpectedTwilioSignature } = require("twilio/lib/webhooks/webhooks");

module.exports.d_balance = async (req, res) => {
  const viewbalance = await Drivers.findById(req.body.id)
    .select("-_id balance ");
  if (!viewbalance) return res.status(404).send("error");
  res.send(viewbalance) ;
};

/////////////////////////////////////

module.exports.d_history  = async (req, res) => {
    let count;
    var tn =new Date (Date.now()- 7* 60 * 60 * 24 * 1000);
    const viewpast = await PastTrips.find({_driver:req.body.id}&&{start:{$gte:tn}})
      .select("-_id start seats price");
    if (!viewpast) return res.status(404).send("error");
    for(let i=0;i<viewpast.length;i++){
      count=0;
      for(let j=0;j<viewpast[i].seats.length;j++){
      count+= viewpast[i].seats[j];}
    viewpast[i].price=viewpast[i].price*count;
    viewpast[i].seats=count;
    };

    res.send( viewpast);
  };
  //////////////////////////////////
  module.exports.b_history= async (req, res) => {
    let count;
    const viewbalance = await Drivers.findById(req.body.id)
       .select("-_id balance ");
    if (!viewbalance) return res.status(404).send("error");

    var tn =new Date (Date.now()- 7* 60 * 60 * 24 * 1000);
     const viewpast = await PastTrips.find({_driver:req.body.id}&&{start:{$gte:tn}})
       .select("-_id start seats price");
     if (!viewpast) return res.status(404).send("error");
     for(let i=0;i<viewpast.length;i++){
       count=0;
       for(let j=0;j<viewpast[i].seats.length;j++){
       count+= viewpast[i].seats[j];}
     viewpast[i].price=viewpast[i].price*count;
     viewpast[i].seats=count;
     };
 
     res.send([viewbalance,viewpast]);
   };
  
