// Modules
const _ = require("lodash")
// Models
const ObjectId = require("mongoose").Types.ObjectId
const { PastTrips, validatePastTrip } = require("../models/past-trips-model")
const { PastTour } = require("../models/past-tours-model")
const { Passengers } = require("../models/passengers-model")
// Configurations
const { appSettings } = require("../startup/config").appConfig()
const driverTimeOut = (appSettings.pairing_process.driver_timeout + appSettings.pairing_process.network_timeout) * 1000,
    passengerTimeOut = (appSettings.pairing_process.passenger_timeout + appSettings.pairing_process.network_timeout) * 1200,
    driverWaiting = (appSettings.pairing_process.driver_waiting + appSettings.pairing_process.network_timeout) * 1000,
    requestTimeOut = (appSettings.pairing_process.request_timeout + appSettings.pairing_process.network_timeout) * 1000,
    arrivePermit = (appSettings.pairing_process.permit_arrive + appSettings.pairing_process.network_timeout) * 1000
// Services & Helpers
const { startTransaction } = require("../db/db")
const {
    setRequestStatus,
    removeTripRequest,
    getTripDetails } = require("../services/firebase");
const { calculateDistances } = require("../services/google-map")
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
            await applyPunishment(tripRef, 1)
            // Delete request after request timeous
            setTimeout(removeTripRequest, requestTimeOut, tripRef)
        }
        else if (data == "passenger_cancelled") {
            // Stop arriving timeout timer
            clearTimeout(timerId.value)
            // Stop the listener
            statusRef.off("value", listenerCallback);
            // Punish the passenger
            await applyPunishment(tripRef, 0)
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
            // Archiving Trip
            await archiveTrip(tripRef);
            // Delete request after request timeous
            setTimeout(removeTripRequest, requestTimeOut, tripRef)
        }
    }
    return listenerCallback;
};

// Punishment function
const applyPunishment = async function (tripRef, user = 0) { // 0=> passenger, 1 => driver
    const trip = await getTripDetails(tripRef),
        tour = await PastTour.findById(trip._tour)
    //  Called for Pssenger
    if (user == 0)
        // Punishing Passenger
        return await payPunishment({
            source: trip._passenger,
            destination: tour._driver,
            amount: trip.cost,
            description: "Punishing passenger for trip cancellation"
        }, 0)
    // Called for Driver
    else {
        const dmResponse = await calculateDistances([trip.passengerLoc], [trip.driverLoc]);
        if (dmResponse.rows[0].elements[0] <= arrivePermit)
            // Punishing Passenger
            return await payPunishment({
                source: trip._passenger,
                destination: tour._driver,
                amount: trip.cost,
                description: "Punishing passenger for trip cancellation"
            }, 0)
        else
            // Punishing Driver
            await payPunishment({
                source: tour._driver,
                destination: trip._passenger,
                amount: trip.cost,
                description: "Punishing driver for trip cancellation"
            }, 1)
    }

};

// Archiving trip
const archiveTrip = async function (tripRef) {
    let session = null;
    try {
        session = await startTransaction();
        // Get Trip Dtails
        let trip = await getTripDetails(tripRef)
        trip = _.pick(trip,
            ["rate", "cost", "seats", "feedBack", "_passenger", "_tour"])
        trip.date = new ObjectId(tripRef.slice(-24)).getTimestamp()

        // Validate trip schema
        const { error, value } = validatePastTrip(trip)
        if (error) throw new Error(error.details[0].message)
        //_line: tripRef.slice(0, 24),
        //_driver: trip._driver,

        // Registering the trip
        trip = (await PastTrips.create([value], { session }))[0]

        // Pushing the trip to the passenger's past-trips
        await Passengers.findOneAndUpdate({ _id: trip._passenger }, {
            $push: { _pastTrips: trip._id }
        }, { session })

        // Pushing the trip to the tour's trips
        await PastTour.findOneAndUpdate({ _id: trip._tour }, {
            $push: { _trips: trip._id }
        }, { session })
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw new Error(error.message)
    }
};
