// Models
const { Passengers } = require("../../models/passengers-model");
const { Payments } = require("../../models/payment-model");
// Controllers
const paypal = require("paypal-rest-sdk");
const { host, port } = require("../../startup/config").serverConfig();
//Helpers
const encryption = require("../../helpers/encryption-helper");
//Secrets
const paypalId=require("../../startup/config").paypalId();
const paypalSecret=require("../../startup/config").paypalSecret();
//Transaction
const { startTransaction } = require("../../db/db");
//Validators




paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:paypalId,
  client_secret:paypalSecret
});

let ChargeOgra = async (req, res) => {


  //encryprion User id
  const encryptId=encryption.encodeId(req.body._passenger);

  var create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal"
    },
    redirect_urls: {
      return_url: `http://${host}:${port}/api/passengers/paypal/success/${encryptId}/${req.body.amount}`,
      cancel_url: `http://${host}:${port}/api/passengers/paypal/cancel`
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

  paypal.payment.create(create_payment_json, function (error, payment) {
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

  //decryprion User id
  const decryptId=encryption.decodeId(req.params.id);

 //confirm paypal payment
  paypal.payment.execute(paymentId, execute_payment_json, async function (
    error,
    payment
  ) {
    if (error) {
      throw error;
    } else {
      const oldBalance = (
        await Passengers.findById(decryptId).select("balance -_id ")
      ).balance;
      total = parseInt(req.params.amount) + oldBalance;
      await Passengers.updateOne(
        { _id:decryptId},
        { $set: { balance: total } }
      );
      var confirmedPayment = {
        amount: parseInt(req.params.amount),
        description: "Paypal",
        type: "Charge",
        _passenger: decryptId
      };
    //Save payment in DB on success
    confirmedPayment = new Payments(confirmedPayment);
    confirmedPayment = await confirmedPayment.save();
    res.send(confirmedPayment);
    }
  });
};
module.exports.ChargeSuccess = ChargeSuccess;

module.exports.ChargeCancel = async (req, res) => { res.send("Cancelled"); };
