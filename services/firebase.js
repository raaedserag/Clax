// FireBase Initialization
const { firebaseAccount,
  fireBaseUrl } = require("../startup/config").firebaseCredentials();
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(firebaseAccount),
  databaseURL: fireBaseUrl,
});
// Definitions
const db = admin.database();
const ObjectId = require('mongoose').Types.ObjectId;
// Helpers
//-----------------------------------------
// FireBase Nodes
const linesNode = "clax-lines", // {"lineId": {"driverId": {"loc": {"lat": "0.0", "lng": "0.0"}, "seats": "4"}}}
  requestsNode = "clax-requests"
// ------------------------ FCM ------------------------

// Push notifications to one user(token string) or multiple users (Array of tokens strings)
module.exports.sendTargetedNotification = async function (tokens, notification, data) {
  try {
    data.click_action = "FLUTTER_NOTIFICATION_CLICK";
    // Push to one device
    if (typeof tokens == "string") {
      return await admin.messaging().send({
        data,
        token: tokens,
        notification,
      });
    }

    // Push to multiple device
    else if (Array.isArray(tokens)) {
      const response = await admin.messaging().sendMulticast({
        data,
        tokens,
        notification,
      });
      if (response.failureCount > 0) {
        let failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          }
        });
        return { response, failedTokens };
      }
    } else throw new Error("\'tokens\' type must be a string or an array of strings");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Push notifications to users registered with some topic
module.exports.sendTopicNotification = async function (topic, notification, data) {
  try {
    data.click_action = "FLUTTER_NOTIFICATION_CLICK";
    if (typeof topic == "string") {
      return await admin.messaging().send({
        data,
        topic,
        notification
      });
    } else throw new Error("\'topic\' type must be a string");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Push notifications to users registered with combination of topics (conditions)
// "'stock-GOOG' in topics || 'industry-tech' in topics";
module.exports.sendConditionalNotification = async function (condition, notification) {
  try {
    if (typeof condition == "string") {
      return await admin.messaging().send({
        data: { click_action: "FLUTTER_NOTIFICATION_CLICK" },
        notification,
        condition,
      });
    } else throw new Error("\'condition\' type must be a string");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Push batch of messages{notification, token || topic} (Maximum 500 message at call)
module.exports.sendBatchNotification = async function (messages) {
  try {
    if (!Array.isArray(messages)) throw new Error("\'tokens\' type must be an array");
    else if (messages.length > 500)
      throw new Error("'messages' limit is 500 at one call");
    else {
      const response = await admin.messaging().sendAll(messages);
      if (response.failureCount > 0) {
        let failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          }
        });
        return { response, failedTokens };
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// Subscribe to some topic
module.exports.subscribeToTopic = async function (tokens, topic) {
  try {
    if (!(Array.isArray(tokens) || typeof topic == "string"))
      throw new Error("\'tokens\' type must be a string or an array of strings");
    else {
      return await admin.messaging().subscribeToTopic(tokens, topic);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// Unsubscribe from some topic
module.exports.unsubscribeFromTopic = async function (tokens, topic) {
  try {
    if (!(Array.isArray(tokens) || typeof topic == "string"))
      throw new Error("\'tokens\' type must be a string or an array of strings");
    else {
      return await admin.messaging().unsubscribeFromTopic(tokens, topic);
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// ------------------------ Real Time DataBase Functions ------------------------
// Add a new tour
module.exports.addTour = async function (tourRef, tour) {
  await db.ref(`${linesNode}/${tourRef}`)
    .set(tour)
};
// Remove a tour
module.exports.removeTour = async function (tourRef) {
  await db.ref(`${linesNode}/${tourRef}`).remove()
};

// Return available drivers(location, seats) of some line who have sufficient number of free seats
module.exports.getLineDrivers = async function (lineId, requiredSeats) {
  try {
    // Query for the available drivers 
    const result = await (await db.ref(`${linesNode}/${lineId}`)
      .orderByChild("seats")
      .startAt(requiredSeats)
      .once("value")
    ).val();
    if (!result) throw new Error('No available drivers with sufficient seats on this line');
    return Object.entries(result)
  } catch (error) {
    throw new Error(error.message)
  }

};

// Create new request object (trips-node/line/driver/trip) 
module.exports.createTripRequest = async function (lineId, seats, passengerId) {
  const tripId = new ObjectId;
  try {
    await db.ref(`${requestsNode}/${lineId}/${tripId}`)
      .set({
        "status": "requesting",
        "seats": seats,
        _passenger: passengerId,
        expectedTime: 20,// To be commented
        _tour: "5eeeb736798a5eb577d9ecc7",// To be commented
        cost: 42.5// To be commented
      })
    return tripId;
  } catch (error) {
    throw new Error(error.message)
  }

};

// Create new request listener to be triggered if status changed to 'pending'
module.exports.reqStatusListener = function (tripRef, callback) {
  const statusRef = db.ref(`${requestsNode}/${tripRef}/status`)
  // Arrise the listener
  statusRef.on("value", callback(tripRef, statusRef))
};

// Set status member of some request to refused
module.exports.setRequestStatus = async function (tripRef, status) {
  try {
    await db.ref(`${requestsNode}/${tripRef}/status`)
      .set(status)
    return true;
  } catch (error) {
    throw new Error(error.message)
  }
};

// Remove some request
module.exports.removeTripRequest = async function (tripRef) {
  try {
    await db.ref(`${requestsNode}/${tripRef}`).remove()
  } catch (error) {
    throw new Error(error.message)
  }
};

// Get trip Dtails
module.exports.getTripDetails = async function (tripRef) {
  try {
    let result = await db.ref(`${requestsNode}/${tripRef}`).once("value")
    return result.val()
  } catch (error) {
    throw new Error(error.message)
  }
};
