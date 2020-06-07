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
const requestsEvent = new (require("events").EventEmitter);
module.exports.requestsEvent = requestsEvent;
//-----------------------------------------
// FireBase Nodes
const linesNode = "clax-lines", // {"lineId": {"driverId": {"loc": {"lat": "0.0", "lng": "0.0"}, "seats": "4"}}}
  requestsNode = "clax-requests",
  tripsNode = "clax-trips";
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
module.exports.sendTopicNotification = async function (topic, notification) {
  try {
    if (typeof topic == "string") {
      return await admin.messaging().send({
        data: { click_action: "FLUTTER_NOTIFICATION_CLICK" },
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

// ------------------------ Real Time DataBase References ------------------------

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
module.exports.createTripRequest = async function (lineId, seats) {
  const tripId = new ObjectId;
  try {
    await db.ref(`${requestsNode}/${lineId}/${tripId}`)
      .set({
        "status": "requesting",
        "seats": seats
      })
    return tripId;
  } catch (error) {
    throw new Error(error.message)
  }

};

// Create new request listener to be triggered if status changed to 'pending'
module.exports.tripRequestListener = async function (tripRef) {
  // Define reference
  const statusRef = db.ref(`${requestsNode}/${tripRef}/status`)
  // Define the callback fumction to be activated/removed
  const listenerCallback = (data) => {
    data = data.val();
    if (data == "requesting") return true;
    else if (data == "accepted") {
      // Stop the listener
      requestsEvent.emit('request_accepted', tripRef)
      statusRef.off("value", listenerCallback);
      return false;
    }
  }
  statusRef.on("value", listenerCallback)

}
