// Modules
const _ = require('lodash')
// Modles
const { Drivers } = require("../models/drivers-model");
const { Passengers } = require("../models/passengers-model");
const { Payments } = require("../models/payment-model");
// Services
const { sendTargetedNotification,
    createTripRequest,
    tripRequestListener,
    requestsEvent } = require("../services/firebase");
// Constants

const driverWaiting = 10; // Constant to define how long to wait the driver to respond(in seconds)
//---------------------------------------------
// Create new trip request
module.exports.createNewTrip = async function (trip, drivers) {
    try {
        const tripId = await createTripRequest(trip.lineId, trip.seats);
        await tripRequestListener(`${trip.lineId}/${tripId}`)
        queryDrivers(`${trip.lineId}/${tripId}`, trip, drivers)
        return tripId;
    } catch (error) {
        throw new Error(error.message)
    }

}
const queryDrivers = async function (requestRef, trip, driversList) {
    try {
        // Define timerId, indexing start, drivers list count
        let timerId, index = { value: 0 };
        const driversCount = driversList.length

        // Listen for the request acceptance
        // Define listener Callback
        const acceptanceCallback = (requestId) => {
            // If the requestedId has been accepted, don't send the next notification
            if (requestId == requestRef) {
                clearInterval(timerId)
                requestsEvent.removeListener('request_accepted', acceptanceCallback)
            };
        }
        // Arrise the listener
        requestsEvent.on('request_accepted', acceptanceCallback)

        // Start sending notification every time interval
        // Define callBack
        const sendToDriver = async function () {
            // Send Next Notification
            console.log('hi')
            await sendTargetedNotification(driversList[index.value][1].fireBaseId, // Token
                // Notification's title & body
                {
                    title: "فاضي يسطى؟",
                    body: `يوجد راكب ينتظرك في ${trip.stationName[0]}`
                },
                // Notification's data
                {
                    request: requestRef,
                    station_name: trip.stationName[0],
                    station_location: JSON.stringify(trip.stationLoc),
                    seats: trip.seats.toString()
                }
            )
            index.value++
            // If drivers list has been consumed, stop sending;
            if (index.value >= driversCount) return clearInterval(timerId);

        }
        await sendToDriver();
        timerId = setInterval(sendToDriver, driverWaiting * 1000)
    } catch (error) {
        throw new Error(error.message)
    }

}

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