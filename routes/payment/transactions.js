// Modules
const router = require("express").Router();
const _ = require("lodash");

// Controllers
const transactionValidators = require("../../validators/transaction-validators");
const transactionsController = require("../../controllers/payment/transactions");
const paymentController = require("../../controllers/payment/payment");
const paymentValidators = require("../../validators/payment-validators");

//// Add a Transfer Money Request
router.post("/add", async (req, res) => {
  // Check Transfer Reqeust Schema
  const { error } = transactionValidators.validateAddRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Retrieve receiver by Number
  const receiverId = await transactionsController.getUserbyNumber(
    req.body.phone
  );
  if (!(receiverId.success && receiverId.result._id)) {
    return res.status(404).send("User doesn't Exist");
  }

  // Check if sender balance is sufficient
  const senderBalance = await paymentController.getUserBalance(req.body.id);
  if (!(senderBalance.success && senderBalance.result))
    throw new Error(senderBalance.result);

  if (senderBalance.result.balance < Number.parseFloat(req.body.amount)) {
    return res.status(500).send("User doesn't have enough mone");
  }

  // Adjusting body to fit Transaction schema
  req.body.from = req.body.id;
  req.body.fromNamed = req.body.name;
  req.body.to = receiverId.result._id.toString();
  req.body.amount = parseFloat(req.body.amount);
  req.body.date = Date.now();
  req.body.status = "pending";
  delete req.body.name;
  delete req.body.id;
  delete req.body.phone;

  const addedRequest = await transactionsController.registerReqeust(req.body);
  if (!(addedRequest.result && addedRequest.success)) {
    throw new Error(addedRequest.result);
  }
  return res.status(200).send("Request was made successfully");
});

//// Cancel Transfer Money Request
router.post("/cancel", async (req, res) => {
  // Check Transfer Reqeust Schema
  const { error } = transactionValidators.validateAddRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const canceledRequest = await transactionsController.fetchRequests(
    req.body.id
  );
  if (!(canceledRequest.success && canceledRequest.result)) {
    return res.status(404).send("UnAuthorized.");
  }

  return res.status(200).send("Request was canceled successfully");
});
//// Cancel Transfer Money Request
router.post("/", async (req, res) => {
  const requests = await transactionsController.fetchRequests(req.body.id);
  if (!(requests.success && requests.result)) {
    return res.status(404).send("Unknown User Id");
  }
  return res.status(200).send(requests.result);
});

//// Transfer Money
router.post("/accept", async (req, res) => {
  req.body.balance = parseFloat(req.body.balance);
  // Check request Schema
  const { error } = transactionValidators.acceptRequest(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Retrieve request information
  const transferRequest = await transactionsController.acceptReqeust(req.body);
  if (!(transferRequest.success && transferRequest.result))
    return res.status(500).send("UnAuthorized");

  // Assign receiver Id
  req.body.receiverId = transferRequest.result.from.toString();
  req.body.amount = transferRequest.result.amount;
  req.body.fromNamed = transferRequest.result.fromNamed;
  delete transferRequest;

  // Retrieve sender stripe account id
  const senderStripe = await paymentController.getUserStripeId(req.body.id);

  // If retreiving sender stripeId failed
  if (!(senderStripe.success && senderStripe.result))
    throw new Error(senderStripe.result);

  // Assign senderStripeId
  req.body.senderStripeId = senderStripe.result.stripeId;

  // Retrieve receiver stripe account id
  const receiverStripe = await paymentController.getUserStripeId(
    req.body.receiverId
  );
  // If retreiving receiver stripeId failed
  if (!(receiverStripe.success && receiverStripe.result))
    throw new Error(receiverStripe.result);

  // // Assign receiverStripeId
  req.body.receiverStripeId = receiverStripe.result.stripeId;

  // Transfer Money from sender to receiver
  const transferTransaction = await transactionsController.transferMoney(
    req.body
  );
  // If transaction hasn't completed
  if (!(transferTransaction.success && transferTransaction.result))
    throw new Error(transferTransaction.result);

  req.body.type = "loaner";
  const canceledRequest = await transactionsController.cencelReqeust(req.body);
  if (!(canceledRequest.success && canceledRequest.result))
    return res.status(404).send("Removing Request went wrong!");

  const sender = {
    amount: parseFloat(req.body.amount),
    _passenger: req.body.id,
    description: req.body.fromNamed,
    type: "Lend",
    date: Date.now()
  };

  const addPayment = await paymentController.registerPayment(sender);
  if (!(addPayment.result && addPayment.success))
    throw new Error(addPayment.result);
  const receiver = {
    amount: parseFloat(req.body.amount),
    _passenger: req.body.receiverId,
    description: req.body.id,
    type: "Borrow",
    date: Date.now()
  };
  let { error3 } = paymentValidators.validatePayment(receiver);
  if (error3) return res.status(400).send(error3.details[0].message);

  const addPayment2 = await paymentController.registerPayment(receiver);
  if (!(addPayment2.result && addPayment2.success))
    throw new Error(addPayment2.result);

  // // IF ALL IS WELL
  return res.send(transferTransaction.result.toString());
});

module.exports = router;
