// Modles
const { Drivers } = require("../models/drivers-model");
const { Passengers } = require("../models/passengers-model");
const { Payments } = require("../models/payment-model");
// Configurations
const { appSettings } = require("../startup/config").appConfig()
const driverTimeOut = (appSettings.pairing_process.driver_timeout + appSettings.pairing_process.network_timeout) * 1000,
    requestTimeOut = (appSettings.pairing_process.request_timeout + appSettings.pairing_process.network_timeout) * 1000
// Services & Helpers 
const { calculateDistances } = require("../services/google-map.js");
const { sortingDrivers,
    queryDrivers } = require("./algorithms")
const { createTripRequest,
    getLineDrivers,
    reqStatusListener,
    setRequestStatus,
    removeTripRequest } = require("../services/firebase");
const { arriseReqConsume,
    arriseReqInterrupt } = require("./eventEmitter")


//--------------------------------------------
// Returns array of sorted drivers -according to duration- entries, Example:
/*drivers[][0] => driverobjectId
  drivers[][1] => {"loc": {"lat": "0.0", "lng": "0.0"}, "seats": "5", "direction", 
                    "fireBaseId": "rrr", "tripId": "tripObjectId"}
  drivers[][2] => {"distance": {"text": "5 Km", "value": "5000"},
                   "duration": {"text": "1 h", "value": "3600"},
                    "status": "OK"}*/
module.exports.getAvailableDrivers = async function (originLoc, line, requiredSeats) {
    try {
        let drivers = await getLineDrivers(line.id, requiredSeats)
        // Check if passed 'drivers' is an array
        if (!Array.isArray(drivers)) throw new Error('\'drivers\' must be an array')

        // Query for drivers distances, storing it with the driver's array
        const dmResponse = await calculateDistances(originLoc.user,
            originLoc.dest,
            drivers.map(d => d[1].loc)) // Pass drivers locations only

        // Map every result to the corresponding driver
        drivers.map((driver, i) => driver.push(dmResponse.driversDistances[i]))

        // Now drivers array contains distance info, let's sort it 
        drivers = sortingDrivers(drivers,
            {
                durValue: dmResponse.userDistance.duration.value,
                direction: line.direction
            })
        // Check if result isn't null, (Can happen when filtering)
        if (!(drivers && drivers.length && drivers[0][0] != null)) throw new Error('No available drivers');

        // If all is well
        return { drivers, stationName: dmResponse.stationName };
    } catch (error) {
        throw new Error(error.message)
    }
};

// Create new trip request
module.exports.createNewTrip = async function (trip, drivers) {
    try {
        // Create new request
        const tripId = await createTripRequest(trip.lineId, trip.seats);
        trip.requestRef = `${trip.lineId}/${tripId}`

        // Start listening to the request status
        reqStatusListener(trip.requestRef, reqListenerCallback)

        // Start Quering drivers one by one, depending on the 'idle' status trigger
        queryDrivers(trip, drivers.map((d) => d[1].fireBaseId))
        return tripId;
    } catch (error) {
        throw new Error(error.message)
    }
}

// Listener callback, passed to firebase to be activated when the request status changed
const reqListenerCallback = function (tripRef, statusRef, timerId = { value: null }) {
    const listenerCallback = function (data) {
        data = data.val();
        // Request is idle, no driver is being queried in the moment
        if (data == "idle") {
            // Stop driver timeout timer
            clearTimeout(timerId.value)
            // Emit next event
            arriseReqConsume(tripRef)
        }
        // Some driver is being queried
        else if (data == "pending_driver") {
            // If driver doesn't respond in defined time, Skip response
            timerId.value = setTimeout(() => setRequestStatus(tripRef, 'idle'),
                driverTimeOut)
        }
        // Some driver has accepted the trip
        else if (data == "accepted") {
            // Stop driver timeout timer
            clearTimeout(timerId.value)
            // Emit interruptance event
            arriseReqInterrupt(tripRef)
            // Stop the listener
            statusRef.off("value", listenerCallback);
            // Delete request after request timeous
            setTimeout(removeTripRequest, requestTimeOut, tripRef)
        }
        // User has cancelled the trip request
        else if (data == "cancelled") {
            // Stop driver timeout timer
            clearTimeout(timerId.value)
            // Emit interruptance event
            arriseReqInterrupt(tripRef)
            // Stop the listener
            statusRef.off("value", listenerCallback);
            // Delete request after request timeous
            setTimeout(removeTripRequest, requestTimeOut, tripRef)
        }
        // No driver has accepted the trip
        else if (data == "refused") {
            // Emit interruptance event
            arriseReqInterrupt(tripRef)
            // Stop the listener
            statusRef.off("value", listenerCallback);
            // Delete request after request timeous
            setTimeout(removeTripRequest, requestTimeOut, tripRef)
        }
    }
    return listenerCallback;

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



