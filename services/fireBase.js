const { firebaseAccount,
  fireBaseUrl } = require("../startup/config").firebaseCredentials();
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(firebaseAccount),
  databaseURL: fireBaseUrl,
});
const db = admin.database();
// ------------------------ FCM ------------------------
// Push notifications to one user(token string) or multiple users (Array of tokens strings)
module.exports.sendTargetedNotification = async function (tokens, notification) {
  try {
    // Push to one device
    if (!(typeof tokens == "string" || Array.isArray(tokens)))
      throw new Error("'tokens' type must be a string or an array of strings");
    else {
      const response = await admin.messaging().sendToDevice(tokens, {
        data: { click_action: "FLUTTER_NOTIFICATION_CLICK" },
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
      return response;
    }
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
module.exports.lineRef = function (line) {
  return db.ref(`clax-lines/${line}`);
} 
