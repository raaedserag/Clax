// Models
const ObjectId = require("mongoose").Types.ObjectId
const { PastTrips, validatePastTrip } = require("../models/past-trips-model")
const { Passengers } = require("../models/passengers-model")
// Configurations
const { appSettings } = require("../startup/config").appConfig()
const driverTimeOut = (appSettings.pairing_process.driver_timeout + appSettings.pairing_process.network_timeout) * 1000,
    passengerTimeOut = (appSettings.pairing_process.passenger_timeout + appSettings.pairing_process.network_timeout) * 1000,
    driverWaiting = (appSettings.pairing_process.driver_waiting + appSettings.pairing_process.network_timeout) * 1000,
    requestTimeOut = (appSettings.pairing_process.request_timeout + appSettings.pairing_process.network_timeout) * 1000
// Services & Helpers
const { startTransaction } = require("../db/db")
const {
    setRequestStatus,
    removeTripRequest,
    removeDriverTrip,
    getTripDetails } = require("../services/firebase");
const { arriseReqConsume,
    arriseReqInterrupt } = require("./eventEmitter");
const { payPunishment } = require("./payments-helper")
//-------------------------------------------------------------------
// Listener callback, passed to firebase to be activated when the request status changed
module.exports.reqListenerCallback = function (tripRef, statusRef, timerId = { value: null }) {
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
                parseInt(trip.val().expectedTime * 1200),
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
            // Stop driver timeout timer
            clearTimeout(timerId.value)
            // Wait for the passenger confirmation
            timerId.value = setTimeout(setRequestStatus, driverWaiting, "passenger_cancelled")
        }
        else if (data == "done") {
            // Stop passenger timeout timer
            clearTimeout(timerId.value)
            // Stop the listener
            statusRef.off("value", listenerCallback);
            // Punish the passenger
            await archiveTrip(tripRef);
            // Delete request after request timeous
            setTimeout(removeTripRequest, requestTimeOut, tripRef)
        }
    }
    return listenerCallback;
};

// Punish driver
const punishDriver = async function (tripRef) {
    const trip = await getTripDetails(tripRef)
    await payPunishment({
        source: trip._driver,
        destination: trip._passenger,
        amount: trip.cost,
        description: "Punishing driver for trip cancellation"
    }, 1)
};

// Punish passenger
const punishPassenger = async function (tripRef) {
    const trip = await getTripDetails(tripRef)
    await payPunishment({
        source: trip._passenger,
        destination: trip._driver,
        amount: trip.cost,
        description: "Punishing passenger for trip cancellation"
    }, 0)
};

// Archiving trip
const archiveTrip = async function (tripRef) {
    let session = null;
    try {
        session = await startTransaction();
        // Get Trip Dtails
        let trip = await getTripDetails(tripRef)

        // Validate trip schema
        const { error, value } = validatePastTrip({
            date: new ObjectId(tripRef.slice(-24)).getTimestamp(),
            rate: trip.rate,
            cost: trip.cost,
            seats: trip.seats,
            feedBack: trip.feedBack,
            _passenger: trip._passenger,
            _line: tripRef.slice(0, 24),
            _driver: trip._driver,
        })
        if (error) throw new Error(error.details[0].message)

        // Archiving the trip
        trip = await PastTrips.create([value], { session })
        await Passengers.findOneAndUpdate({ _id: trip._passenger }, {
            $push: { _pastTrips: trip[0]._id }
        }, { session })
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw new Error(error.message)
    }
};
