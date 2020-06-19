// Configurations
const { appSettings } = require("../startup/config").appConfig()
const driverTimeOut = (appSettings.pairing_process.driver_timeout + appSettings.pairing_process.network_timeout) * 1000,
    passengerTimeOut = (appSettings.pairing_process.passenger_timeout + appSettings.pairing_process.network_timeout) * 1000,
    requestTimeOut = (appSettings.pairing_process.request_timeout + appSettings.pairing_process.network_timeout) * 1000
// Services & Helpers
const { calculateDistances } = require("../services/google-map.js");
const { sortingDrivers,
    queryDrivers } = require("./algorithms")
const { createTripRequest,
    getLineDrivers,
    reqStatusListener,
    setRequestStatus,
    removeTripRequest,
    removeDriverTrip,
    startTrip,
    getTripDetails } = require("../services/firebase");
const { arriseReqConsume,
    arriseReqInterrupt } = require("./eventEmitter");


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
    const listenerCallback = async function (data) {
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
            // If driver doesn't respond in defined time, Skip driver
            timerId.value = setTimeout(setRequestStatus,
                driverTimeOut,
                tripRef, 'idle')
        }
        // Some driver has accepted the trip
        else if (data == "pending_passenger") {
            // Stop driver timeout timer
            clearTimeout(timerId.value)
            // If passenger doesn't respond in defined time, cancel the request
            timerId.value = setTimeout(setRequestStatus,
                passengerTimeOut,
                tripRef, "cancelled")
        }
        // User has cancelled the trip request
        else if (data == "cancelled") {
            // Stop driver/passenger timeout timer
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
        // Some driver has accepted the trip
        else if (data == "confirmed") {
            // Stop driver/passenger timeout timer
            clearTimeout(timerId.value)
            // Emit interruptance event
            arriseReqInterrupt(tripRef)
            // Change Status
            setRequestStatus(tripRef, "waiting")
        }
        else if (data == "waiting") {
            const trip = await statusRef.parent.once("value")
            timerId.value = setTimeout(setRequestStatus,
                parseInt(trip.val().expectedTime * 1000),
                tripRef, "driver_cancelled")
        }
        else if (data == "driver_cancelled") {
            // Stop arriving timeout timer
            clearTimeout(timerId.value)
            // Stop the listener
            statusRef.off("value", listenerCallback);
            // Punish the driver
            await punishDriver(tripRef)
            // Delete request after request timeous
            setTimeout(removeTripRequest, requestTimeOut, tripRef)
        }
        else if (data == "passenger_cancelled") {
            // Stop arriving timeout timer
            clearTimeout(timerId.value)
            // Stop the listener
            statusRef.off("value", listenerCallback);
            // Punish the passenger
            await punishPassenger(tripRef)
            // Delete request after request timeous
            setTimeout(removeTripRequest, requestTimeOut, tripRef)
        }
        else if (data == "arrived") {
            // Stop driver/passenger timeout timer
            clearTimeout(timerId.value)
            // Creating the trip
            startTrip(tripRef)
        }
        else if (data == "done") {
            // Stop the listener
            statusRef.off("value", listenerCallback);
            // Punish the passenger
            await finishTrip(tripRef);
            // Delete request after request timeous
            setTimeout(removeTripRequest, requestTimeOut, tripRef)
        }
    }
    return listenerCallback;
};

// Finishing Trip
const finishTrip = async function (tripRef) {
    // Get Trip Dtails
    const trip = await getTripDetails(tripRef)
    // Archive Details
    await archiveTrip(trip)
    // If cash didn't paid, charge online cash
    if (!trip.cash_payed) {
        await chargeOnline(trip)
    }
    // Remove driver trip
    await removeDriverTrip(trip._driver, tripRef.slice(-24))
};

// Punish driver
const punishDriver = async function (tripRef) {
    console.log("Punish Driver")
};

// Punish passenger
const punishPassenger = async function (tripRef) {
    console.log("Punish Passenger")
};

// Archiving trip
const archiveTrip = async function (trip) {
    console.log("خزن يالا")
};

// Charge online
const chargeOnline = async function (charge) {
    console.log("ادفع يالا ")
};
