// Modles
const { Drivers } = require("../models/drivers-model");
const { Passengers } = require("../models/passengers-model");
const { Payments } = require("../models/payment-model");
// Services
const { distanceMatrix } = require("../services/google-map.js");
const { dataBase, lineRef } = require("../services/firebase");
//--------------------------------------------

module.exports.minimumDistanceIndex = async function (origin, dest) {
  let elements = await distanceMatrix(origin, dest);
  // ------------
  // Approch 1
  // Runtime: 110.021 ms
  let distance = [];

  distance.sort;
  // Extracting Numeric Distance Value
  elements.forEach((element) => {
    distance.push(element.distance.value);
  });

  // Assigning Index to each valie
  distance.forEach((element, index) => (distance[index] = [element, index]));

  // Sorting Distance Increasingly
  distance.sort(function (left, right) {
    return left[0] < right[0] ? -1 : 1;
  });

  // Mapping values to index in .sortIndices
  sortedIndices = [];
  distance.forEach((element) => sortedIndices.push(element[1]));

  return sortedIndices;
};

// Approch 2
// Runtime: 105.0 ms
// Uncomment the code below
// var shortest = 0;
// let currentDistance = 10000000;
// elements.forEach((element, index) => {
//   if (element.distance.value <= currentDistance) {
//     currentDistance = element.distance.value;
//     shortestt = index;
//   }
// });

// Transfer Money between Passenger & Driver
module.exports.adjustBalance = async function (passengerId, driverId, trip) {
  try {
    //// Passenger Balance Adjustment
    // Pay balance amount from Passenger's balance
    let passenger = await Passengers.findByIdAndUpdate(passengerId, {
      balance: -parseFloat(trip.price),
    });
    if (!passenger) throw new Error("Passenger Not Found !");

    // Passenger's Trip payment
    let tripPayment = await Payments.create([
      {
        amount: parseFloat(trip.price),
        _passenger: passengerId,
        description: trip.location,
        type: "Pay",
        date: Date.now(),
      },
    ]);
    let result = await Passengers.updateOne(
      { _id: passengerId },
      { $push: { _payments: tripPayment._id } }
    );
    // Driver Balance Adjustment
    // Charge balance amount to Driver's balance
    let driver = await Drivers.findByIdAndUpdate(driverId, {
      $inc: { balance: parseFloat(trip.price) },
    })
      .select("-_id balance")
      .lean();
    if (!driver) throw new Error("Driver Not Found !");

    // // Passenger's Trip payment
    // let tripPayment = await Payments.create([
    //   {
    //     amount: parseFloat(trip.price),
    //     _passenger: passengerId,
    //     description: trip.location,
    //     type: "Pay",
    //     date: Date.now(),
    //   },
    // ]);

    // await Passengers.updateOne(
    //   { _id: passengerId },
    //   { $push: { _payments: tripPayment._id } },
    //   { session }
    // );
    return true;
  } catch (error) {
    console.log(error);
    return false;
    // throw new Error("Transaction Failed !\n" + error.message);
  }
};

// Return available drivers(location, seats) of some line who have sufficient number of free seats
module.exports.getAvailableDrivers = async function (lineId, requiredSeats) {
  return await (
    await lineRef(lineId)
      .orderByChild("seats")
      .startAt(requiredSeats)
      .once("value")
  ).val();
};
