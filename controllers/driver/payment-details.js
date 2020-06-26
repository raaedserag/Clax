const { Drivers } = require("../../models/drivers-model");
const { PastTrips } = require("../../models/past-trips-model");
const { getExpectedTwilioSignature } = require("twilio/lib/webhooks/webhooks");
const { string } = require("@hapi/joi");
const { intersection } = require("lodash");
var history,history2,history3;
module.exports.d_balance = async (req, res) => {
  const viewbalance = await Drivers.findById(req.body.id)
    .select("-_id balance ");
  if (!viewbalance) return res.status(404).send("error");
  res.send(viewbalance) ;
};  

/////////////////////////////////////
module.exports.d_history = async (req, res) => {
  let s,c;
  var tn =new Date (Date.now()- 7* 60 * 60 * 24 * 1000);
  const viewpast = await Drivers.findById(req.body.id)
    .select("-_id _tours")
    .populate({
      path: "_tours",
      match: { date: { $gte:tn } },
      select: " -_id _line date _trips"
    , populate: [
      { path: "_line", select: "-_id from to" },
      { path: "_trips",select: "-_id cost seats "} ]
    });
  if (!viewpast) return res.status(404).send("error");
  history=viewpast._tours;
  console.log(viewpast);
  history2={};
  history3=[];
  for(let i=0;i<history.length;i++){
    let s=0,c=0,history2={};
           for(let j=0;j<history[i]._trips.length;j++){
               s+=history[i]._trips[j].seats;
               c+=history[i]._trips[j].cost;}
                history2.date=history[i].date;
                history2.line=history[i]._line;
                history2.cost=c;
                history2.seats=s;
                console.log(history2);
                history3.push(history2);
              };
res.send(history3);
};
