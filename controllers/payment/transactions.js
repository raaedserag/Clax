const transactionDebugger = require("debug")("Clax:transactionDebugger");
// Models
const { Passengers } = require("../../models/passengers-model");
const { Transactions } = require("../../models/transactions-model");
// Controllers
const stripeController = require("./stripe");
const paypal = require("paypal-rest-sdk");
const port = require("../../startup/config").port();

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "Afz2ZG4x08P1iadRg9EjWYIbHSwwzZtpYknahjk88d3Vujz3PVG_PhHtta_LdNzZEdMn1mnbz7GdTLJL",
  client_secret:
    "EOjDIHOxb4CkPstrtjU8kW1os5_y_PTEEF05aVgZrNsE7L_V6S7VuAf-VJNFhMRIy4Q7pSTTFZAQh6u3"
});

let payOgra = async (req, res) => {
  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal"
    },
    redirect_urls: {
      return_url: `http://localhost:${port}/success/${req.body._passenger}/${req.body.price}`,
      cancel_url: `http://localhost:${port}/cancel`
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Balance Adjustment",
              sku: "001",
              price: parseInt(req.body.price),
              currency: "USD",
              quantity: 1
            }
          ]
        },
        amount: {
          total: parseInt(req.body.price),
          currency: "USD"
        },
        description: "Balance Adjustment"
      }
    ]
  };

  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.send(payment.links[i].href);
        }
      }
    }
  });
};
module.exports.payOgra = payOgra;

let ograSuccess = async (req, res) => {
  execute_payment_json = {
    transactions: [
      {
        amount: {
          total: parseInt(req.params.amount),
          currency: "USD"
        }
      }
    ]
  };
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  execute_payment_json.payer_id = payerId;

  paypal.payment.execute(paymentId, execute_payment_json, async function(
    error,
    payment
  ) {
    if (error) {
      throw error;
    } else {
      const oldBalance = (
        await Passengers.findById(req.params.id).select("balance -_id ")
      ).balance;
      total = parseInt(req.params.amount) + oldBalance;
      await Passengers.updateOne(
        { _id: req.params.id },
        { $set: { balance: total } }
      );
      res.send({
        chargedBalance: parseInt(req.params.amount),
        oldBalance: oldBalance,
        newBalance: total
      });
    }
  });
};
module.exports.ograSuccess = ograSuccess;

let ograCancel = async (req, res) => {
  res.send("Cancelled");
};
module.exports.ograCancel = ograCancel;

// Retreive User by number
module.exports.getUserbyNumber = async function(number) {
  try {
    let user = await Passengers.findOne({ phone: number }).select("_id name");
    if (user == null) user = { _id: false };
    return { success: true, result: user };
  } catch (error) {
    transactionDebugger(error.message);
    return { success: false, result: error.message };
  }
};

// Cancel request to Database
module.exports.cencelReqeust = async function(body) {
  try {
    if (body.type == "loanee") {
      let cancel = await Transactions.findOneAndRemove({
        from: body.id,
        _id: body.transactionId
      });
      return { success: true, result: cancel };
    } else {
      let cancel = await Transactions.findOneAndRemove({
        to: body.id,
        _id: body.transactionId
      });
      return { success: true, result: cancel };
    }
  } catch (error) {
    transactionDebugger(error.message);
    return { success: false, result: error.message };
  }
};
module.exports.fetchRequests = async function(id) {
  try {
    let result = await Transactions.find({
      to: id
    });
    return { success: true, result: result };
  } catch (error) {
    transactionDebugger(error.message);
    return { success: false, result: error.message };
  }
};
// Accept request to Database
module.exports.acceptReqeust = async function(data) {
  try {
    let request = await Transactions.findOne({
      to: data.id,
      _id: data.transactionId
    });
    return { success: true, result: request };
  } catch (error) {
    transactionDebugger(error.message);
    return { success: false, result: error.message };
  }
};

// Add request to Database
module.exports.registerReqeust = async function(transfer) {
  try {
    await new Transactions(transfer).save();
    return { success: true, result: true };
  } catch (error) {
    return { success: true, result: error.message };
  }
};
// Transfer Money between users
module.exports.transferMoney = async function(transfer) {
  try {
    // Update sender database balance
    const sender = await Passengers.findByIdAndUpdate(transfer.id, {
      $inc: { balance: -parseInt(transfer.amount) }
    }).select("-_id balance");
    // Update receiver database balance
    const receiver = await Passengers.findByIdAndUpdate(transfer.receiverId, {
      $inc: { balance: +parseInt(transfer.amount) }
    }).select("-_id balance");
    // Update sender stripe account
    await stripeController.updateCustomer(transfer.senderStripeId, {
      balance: (-parseInt(sender.balance) + parseInt(transfer.amount)) * 100
    });
    // Update receiver stripe account
    await stripeController.updateCustomer(transfer.receiverStripeId, {
      balance: -(parseInt(receiver.balance) + parseInt(transfer.amount)) * 100
    });
    // return esult
    return { success: true, result: sender.balance };
  } catch (error) {
    transactionDebugger(error.message);
    return { success: false, result: error.message };
  }
};
