// Modules
const _ = require("lodash");
// Models
const { Complaints } = require("../models/complaints-model");
// DB
const { startTransaction } = require("../db/db");
//----------------

module.exports.pushPassengerComplain = async function (
  customerId,
  newComplain
) {
  let session = null;
  try {
    // Start Transaction Session
    session = await startTransaction();
    // Create new complain object
    newComplain = await Complaints.create([newComplain], { session });
    // Push complain to passenger account
    const updatingResult = await Passengers.findByIdAndUpdate(
      customerId,
      {
        $push: { _complaints: newComplain._id },
      },
      { session }
    );
    if (updatingResult.n == 0) throw new Error("User Not found");
    // If completed successfully
    await session.commitTransaction();
    return _.map(
      newComplain,
      _.partialRight(_.pick, [
        "response",
        "text",
        "date",
        "status",
        "code",
        "_trip",
      ])
    )[0];
  } catch (error) {
    await session.abortTransaction();
    throw new Error("Transaction Failed !\n" + error.message);
  }
};
