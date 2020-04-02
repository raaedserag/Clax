// Models
const { Passengers } = require("../../models/passengers-model");
const { Transactions } = require("../../models/transactions-model");
// Helpers
const { transferMoney } = require("../../helpers/transasctions");
// Validators
const {
  validateAcceptRequest,
  validateAddRequest,
  validateCancelRequest
} = require("../../validators/transaction-validators");

//// Add a Transfer Money Request
module.exports.addRequest = async (req, res) => {
  // Check Transfer Reqeust Schema
  const { error } = validateAddRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Retrieve receiver by Number
  const loaner = await Passengers.findOne({ phone: req.body.phone }).select(
    "_id name balance"
  );

  // Check if sender balance is sufficient
  if (loaner.balance < Number.parseFloat(req.body.amount)) {
    return res.status(204).send("هذا المستخدم لا يوجد لديه رصيد كافي.");
  }

  // Adjusting body to fit Transaction schema
  req.body.loanee = req.passenger._id;
  req.body.loaneeNamed = req.body.name;
  req.body.loaner = loaner._id.toString();
  req.body.amount = parseFloat(req.body.amount);
  req.body.date = Date.now();
  req.body.status = "pending";
  delete req.body.name;
  delete req.body.phone;

  await new Transactions(req.body).save();
  return res.status(200).send("تم إضافة طلبك بنجاح.");
};

//// Cancel a Request
module.exports.cancelRequest = async (req, res) => {
  const { error } = validateCancelRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.body.type == "loanee") {
    await Transactions.findOneAndRemove({
      loanee: req.passenger._id,
      _id: req.body.transactionId
    });
  } else {
    await Transactions.findOneAndRemove({
      loaner: req.passenger._id,
      _id: req.body.transactionId
    });
  }
  return res.send("Request was canceled successfully");
};

//// Fetch Transfer Money Request
module.exports.fetchRequests = async (req, res) => {
  const requests = await Transactions.find({
    loaner: req.passenger._id
  }).select("_id loaneeNamed date amount");

  return res.send(requests);
};

//// Accept a Request
module.exports.acceptRequest = async (req, res) => {
  // Check request Schema
  const { error } = validateAcceptRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Retrieve request information
  const transferRequest = await Transactions.findOne({
    loaner: req.passenger._id,
    _id: req.body.transactionId
  });
  if (transferRequest == null)
    return res
      .status(204)
      .send("هذه الدعوه غير صحيحه. تأكد منها و حاول مره اخرى.");

  // Retrieve receiver by Number
  const loanerBalance = await Passengers.findById(
    transferRequest.loaner
  ).select("-_id balance");

  // Check if sender balance is sufficient
  if (
    parseFloat(loanerBalance.balance) <
    Number.parseFloat(transferRequest.amount)
  ) {
    return res.status(204).send("هذا المستخدم لا يوجد لديه رصيد كافي.");
  }
  // Transfer Money from sender to receiver
  const transferTransaction = await transferMoney(transferRequest, req);
  // // IF ALL IS WELL
  return res.send(transferTransaction);
};
