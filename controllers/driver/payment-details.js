const { Drivers } = require("../../models/drivers-model");
const { PastTrips } = require("../../models/past-trips-model");
const { getExpectedTwilioSignature } = require("twilio/lib/webhooks/webhooks");
const { string } = require("@hapi/joi");
const { intersection } = require("lodash");
var history, history2, history3;

module.exports.balance = async (req, res) => {
  const viewbalance = await Drivers.findById(req.user._id)
    .select("-_id balance ")
    .lean();
  res.send(viewbalance);
};

module.exports.history = async (req, res) => {
  var lastSevenDays = new Date(Date.now() - 7 * 60 * 60 * 24 * 1000);
  const viewpast = await Drivers.findById(req.user._id)
    .select("-_id _tours")
    .populate({
      path: "_tours",
      filter: { date: { $gte: lastSevenDays } },
      select: " -_id _line date _trips",
      populate: [
        { path: "_line", select: "-_id from to" },
        { path: "_trips", select: "-_id cost seats " },
      ],
    })
    .lean();
  if (!viewpast) return res.status(404).send("User not found");
  if (!viewpast._tours) return res.status(200).send([]);
  history = viewpast._tours;
  history3 = [];
  for (let i = 0; i < history.length; i++) {
    let s = 0,
      c = 0,
      history2 = {};
    for (let j = 0; j < history[i]._trips.length; j++) {
      s += history[i]._trips[j].seats;
      c += history[i]._trips[j].cost;
    }
    history2.date = history[i].date;
    history2.line = history[i]._line;
    history2.cost = c;
    history2.seats = s;
    history3.push(history2);
  }
  res.send(history3);
};

module.exports.balanceHistory = async (req, res) => {
  var lastSevenDays = new Date(Date.now() - 7 * 60 * 60 * 24 * 1000);
  const viewpast = await Drivers.findById(req.user._id)
    .select("-_id _tours balance")
    .populate({
      path: "_tours",
      filter: { date: { $gte: lastSevenDays } },
      select: " -_id _line date _trips",
      populate: [
        { path: "_line", select: "-_id from to" },
        { path: "_trips", select: "-_id cost seats " },
      ],
    })
    .lean();
  if (!viewpast) return res.status(404).send("User not found");
  if (!viewpast._tours) return res.status(200).send([]);
  history = viewpast._tours;
  history3 = [];
  for (let i = 0; i < history.length; i++) {
    let s = 0,
      c = 0,
      history2 = {};
    for (let j = 0; j < history[i]._trips.length; j++) {
      s += history[i]._trips[j].seats;
      c += history[i]._trips[j].cost;
    }
    history2.date = history[i].date;
    history2.line = history[i]._line;
    history2.cost = c;
    history2.seats = s;

    history3.push(history2);
  }
  viewpast._tours = history3;
  res.send(viewpast);
};
