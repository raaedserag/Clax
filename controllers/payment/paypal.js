// Models
const { Passengers } = require("../../models/passengers-model");
const { Payment } = require("../../models/payment-model");
// Controllers
const paypal = require("paypal-rest-sdk");
const port = require("../../startup/config").port();

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "Afz2ZG4x08P1iadRg9EjWYIbHSwwzZtpYknahjk88d3Vujz3PVG_PhHtta_LdNzZEdMn1mnbz7GdTLJL",
  client_secret:
    "EOjDIHOxb4CkPstrtjU8kW1os5_y_PTEEF05aVgZrNsE7L_V6S7VuAf-VJNFhMRIy4Q7pSTTFZAQh6u3"
});

let ChargeOgra = async (req, res) => {
  // var payment={
  //   amount: req.body.amount,
  //   _passenger: req.body._passenger,

  // };
  // payment = new Payment(payment);
  // payment = await payment.save();

  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal"
    },
    redirect_urls: {
      return_url: `http://localhost:${port}/api/paypal/success/${req.body._passenger}/${req.body.amount}/${req.body.type}`,
      cancel_url: `http://localhost:${port}/api/paypal/cancel`
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "Balance Adjustment",
              sku: "001",
              price: parseInt(req.body.amount),
              currency: "USD",
              quantity: 1
            }
          ]
        },
        amount: {
          total: parseInt(req.body.amount),
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
module.exports.ChargeOgra = ChargeOgra;

let ChargeSuccess = async (req, res) => {
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
      var confirmedPayment = {
        amount: parseInt(req.params.amount),
        description: "Paypal",
        type: "Charge",
        _passenger: req.params.id
      };
      //Save payment in DB on success
      confirmedPayment = new Payment(confirmedPayment);
      confirmedPayment = await result.save();
      res.send(confirmedPayment);
    }
  });
};
module.exports.ChargeSuccess = ChargeSuccess;

let ChargeCancel = async (req, res) => {
  res.send("Cancelled");
};
module.exports.ChargeCancel = ChargeCancel;
