const { Passengers } = require("../models/passengers-model");
var paypal = require("paypal-rest-sdk");
const port = require("../startup/config").port();

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
              price: req.body.price,
              currency: req.body.currency,
              quantity: 1
            }
          ]
        },
        amount: {
          total: req.body.price,
          currency: req.body.currency
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
      console.log(error);
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

let ograCancel = async (req, res) => {
  res.send("Cancelled");
};

module.exports.payOgra = payOgra;
module.exports.ograSuccess = ograSuccess;
module.exports.ograCancel = ograCancel;
