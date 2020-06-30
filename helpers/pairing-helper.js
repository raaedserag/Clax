// Models
const { PastTour } = require("../models/past-tours-model");
// Configurations
const { appSettings } = require("../startup/config").appConfig();
const permitVal = appSettings.pairing_process.permit_start,
  permitInter = appSettings.pairing_process.permit_interval;
// Helpers & Services
const {
  getLineDrivers,
  createTripRequest,
  reqStatusListener,
  setRequestStatus,
} = require("../services/firebase");
const { calculateDistances } = require("../services/google-map.js");
const { reqListenerCallback } = require("./trip-helper");
const {
  listenReqInterrupt,
  deafReqInterrupt,
  listenReqConsume,
  deafReqConsume,
} = require("../helpers/eventEmitter");
//-------------------------------------------------------
// Returns array of sorted drivers -according to duration- entries, Example:
/*drivers[][0] => tour objectId
  drivers[][1] => {"loc": {"lat": "0.0", "lng": "0.0"}, "seats": "5", "direction"}
  drivers[][2] => {"distance": {"text": "5 Km", "value": "5000"},
                   "duration": {"text": "1 h", "value": "3600"},
                    "status": "OK"}*/
module.exports.getAvailableDrivers = async function (
  originLoc,
  line,
  requiredSeats
) {
  try {
    let drivers = await getLineDrivers(line.id, requiredSeats);
    // Check if passed 'drivers' is an array
    if (!Array.isArray(drivers)) throw new Error("'drivers' must be an array");

    // Query for drivers distances, storing it with the driver's array
    let dmResponse = await calculateDistances(
      [originLoc.dest],
      [originLoc.user].concat(drivers.map((d) => d[1].loc))
    );
    dmResponse = {
      userDistance: dmResponse.rows[0].elements[0],
      driversDistances: dmResponse.rows[0].elements.slice(1),
      stationName: dmResponse.destination_addresses[0],
    };

    // Map every result to the corresponding driver
    drivers.map((driver, i) => driver.push(dmResponse.driversDistances[i]));

    // Now drivers array contains distance info, let's sort it
    drivers = distancesMergeSorting(drivers, {
      durValue: dmResponse.userDistance.duration.value,
      direction: line.direction,
    });
    // Check if result isn't null, (Can happen when filtering)
    if (!(drivers && drivers.length && drivers[0][0] != null))
      throw new Error("No available drivers");

    // If all is well
    return { drivers, stationName: dmResponse.stationName };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Create new trip request
module.exports.createNewTrip = async function (trip, drivers, passenger) {
  try {
    // Create new request
    const tripId = await createTripRequest(trip.lineId, trip.seats, passenger);
    trip.requestRef = `${trip.lineId}/${tripId}`;

    // Start listening to the request status
    reqStatusListener(trip.requestRef, reqListenerCallback);

    // Start Quering drivers one by one, depending on the 'idle' status trigger
    queryDrivers(
      trip,
      drivers.map((d) => d[0])
    );
    return tripId;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Customized merge sorting, sorting objects according to 'distance.value'
// Note, it takes only objects with 'status'=='OK', while ignoring the others
const distancesMergeSorting = function (
  drivers,
  user,
  permit = { value: permitVal, interval: permitInter }
) {
  // No need to sort the array if the array only has one element or empty
  if (drivers.length == 1) {
    // Filtration Rules
    if (
      drivers[0][1].direction != user.direction ||
      drivers[0][2].status != "OK" ||
      drivers[0][2].duration.value < user.durValue + permit.value
    )
      // If any condition metm set driver id to null
      drivers[0][0] = null;
    // For each driver taken, increase the permition value by defined interval
    else permit.value += permit.interval;

    return drivers;
  }

  const middle = Math.floor(drivers.length / 2);
  // Using recursion to combine the left and right
  return distancesMerging(
    distancesMergeSorting(drivers.slice(0, middle), user, permit),
    distancesMergeSorting(drivers.slice(middle), user, permit)
  );
};
// Merge the two arrays: left and right
const distancesMerging = function (left, right) {
  let resultArray = [],
    leftIndex = 0,
    rightIndex = 0;
  // We will concatenate values into the resultArray in order
  while (leftIndex < left.length && rightIndex < right.length) {
    // Ignore elements which id = null
    if (left[leftIndex][0] == null) {
      leftIndex++;
      continue;
    }
    if (right[rightIndex][0] == null) {
      rightIndex++;
      continue;
    }
    // Merge elements while sorting them ascendingly
    if (
      left[leftIndex][2].duration.value < right[rightIndex][2].duration.value
    ) {
      resultArray.push(left[leftIndex]);
      leftIndex++; // move left array cursor
    } else {
      resultArray.push(right[rightIndex]);
      rightIndex++; // move right array cursor
    }
  }
  // We need to concat here because there will elements remaining from either left OR the right
  return resultArray
    .concat(left.slice(leftIndex).filter((d) => d[0] != null))
    .concat(right.slice(rightIndex).filter((d) => d[0] != null));
};

// Query Drivers one by one, and stop when 1 of them responded by acceptance, cancellation, refusing
const queryDrivers = async (trip, driversList) => {
  try {
    // Define indexing start(0) and max(drivers list count)
    let index = { value: 0, max: driversList.length };

    // Listen for the request consuming
    const sendCallback = sendNextCallback(trip, driversList, index);
    listenReqConsume(sendCallback);

    // Listen for the request Interrupting
    listenReqInterrupt(stopSendingCallback(trip.requestRef, sendCallback));

    // Trigger the first driver sending process, by setting the request status to idle
    await setRequestStatus(trip.requestRef, "idle");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Take next notification callback
const sendNextCallback = function (trip, drivers, index) {
  return async function (requestId) {
    if (requestId == trip.requestRef) {
      // If drivers list has been consumed, stop sending;
      if (index.value >= index.max) {
        // Set trip status to refused
        return await setRequestStatus(trip.requestRef, "refused");
      } else {
        // Send Next Notification
        await sendTripNotification(drivers[index.value], trip);

        // Wait for the driver response
        await setRequestStatus(trip.requestRef, "pending_driver");

        // Increase counter to point to next driver
        index.value++;
      }
    }
  };
};

// Send notification by trip details
const sendTripNotification = async function (tourId, trip) {
  let result = await PastTour.findById(tourId)
    .select("-_id _driver")
    .populate({
      path: "_driver",
      select: "-_id fireBaseId",
    })
    .lean();
  //   console.log(result._driver.fireBaseId);
  /* let bodyText;
    if (trip.seats == 1) bodyText = "يوجد راكب في انتظارك";
    else bodyText = "يوجد ركاب في انتظارك";
    await sendTargetedNotification(id, // Token
        // Notification's title & body
        {
            title: "فاضي يسطى؟",
            body: bodyText
        },
        // Notification's data
        {
            type: "tripRequest",
            request: trip.requestRef,
            station_name: trip.stationName,
            station_location: JSON.stringify(trip.stationLoc),
            seats: trip.seats.toString()
        }
    ) */
};

// Stooping Sending callback
const stopSendingCallback = function (requestRef, resumingCallback) {
  const stoppingCallback = function (requestId) {
    // If the requestedId has been accepted, don't send the next notification
    if (requestId == requestRef) {
      // Remove listeners
      deafReqInterrupt(stoppingCallback);
      deafReqConsume(resumingCallback);
    }
  };
  return stoppingCallback;
};
