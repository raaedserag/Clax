const { firebaseAccount, fireBaseUrl } = require("../startup/config").firebaseCredentials();
const admin = require("firebase-admin")
admin.initializeApp({
  credential: admin.credential.cert(firebaseAccount),
  databaseURL: fireBaseUrl
});;

// Push notifications to one user(token string) or multiple users (Array of tokens strings)
module.exports.sendTargetedNotification = async function (tokens, data) {
  try {
    // Push to one device
    if (typeof tokens == "string") {
      return await admin.messaging().send({ data, token: tokens })
    }

    // Push to multiple device
    else if (Array.isArray(tokens)) {
      const response = await admin.messaging().sendMulticast({ data, tokens })
      if (response.failureCount > 0) {
        let failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          }
        });
        return { response, failedTokens }
      }
    }
    else throw new Error('Unexpected \'tokens\' type');

  } catch (error) {
    throw new Error(error.message);
  }
};

// Push notifications to users registered with some topic
module.exports.sendTopicNotification = async function (topic, data) {
  try {
    if (typeof topic == "string") {
      return await admin.messaging().send({ data, topic })
    }
    else throw new Error('Unexpected \'topic\' type');

  } catch (error) {
    throw new Error(error.message);
  }
};

// Push notifications to users registered with combination of topics (conditions)
// "'stock-GOOG' in topics || 'industry-tech' in topics";
module.exports.sendConditionalNotification = async function (condition, data) {
  try {
    if (typeof condition == "string") {
      return await admin.messaging().send({
        notification: { data }, condition
      })
    }
    else throw new Error('Unexpected \'condition\' type');

  } catch (error) {
    throw new Error(error.message);
  }
};

// Push batch of messages{notification, token || topic} (Maximum 500 message at call)
module.exports.sendBatchNotification = async function (messages) {
  try {
    if (!Array.isArray(messages)) throw new Error('Unexpected \'messages\' type');
    else if (messages.length > 500) throw new Error('\'messages\' limit is 500 at one call');
    else {
      const response = await admin.messaging().sendAll(messages)
      if (response.failureCount > 0) {
        let failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          }
        });
        return { response, failedTokens }
      }
    }

  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports.subscribeToTopic = async function () {

}