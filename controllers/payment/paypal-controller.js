// Models
const { Passengers } = require("../../models/passengers-model");
const { Payments } = require("../../models/payment-model");
// Controllers
const paypal = require("paypal-rest-sdk");
const { host, port } = require("../../startup/config").serverConfig();
//Helpers
const encryption = require("../../helpers/encryption-helper");
//Secrets
const {
  paypalId,
  paypalSecret,
} = require("../../startup/config").paypalCredentials();
//Transaction
const { startTransaction } = require("../../db/db");
//Validators
const {
  validatePaypalRequest,
} = require("../../validators/manage-financials-validators");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: paypalId,
  client_secret: paypalSecret,
});

let ChargeOgra = async function (req, res) {
  try {
    //encryprion User id
    const encryptId = encryption.encodeId(req.user._id);
    //create payment object
    var create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `http://${host}:${port}/api/passengers/paypal/success/${encryptId}/${req.body.amount}`,
        cancel_url: `http://${host}:${port}/api/passengers/paypal/cancel`,
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
                quantity: 1,
              },
            ],
          },
          amount: {
            total: parseInt(req.body.amount),
            currency: "USD",
          },
          description: "Balance Adjustment",
        },
      ],
    };
    //validate charged amount
    validateObject = {
      amount: req.body.amount,
    };
    const { error } = validatePaypalRequest(validateObject);
    if (error) return res.status(400).send(error.details[0].message);

    //create payment process
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
  } catch (error) {
    res.status(400).send("Invalid Data.");
  }
};

module.exports.ChargeOgra = ChargeOgra;

let ChargeSuccess = async function (req, res) {
  let session = null;
  session = await startTransaction();

  var payment = await Payments.create(
    [
      {
        amount: parseInt(req.body.amount),
        description: "Paypal",
        type: "Charge",
        _passenger: req.user._id,
      },
    ],
    { session }
  );

  await Passengers.findByIdAndUpdate(
    req.user._id,
    {
      $inc: { balance: request.amount },
      $push: { _payments: payment[0].id },
    },
    { session }
  ).lean();

  await session.commitTransaction();
  res.send(confirmedPayment);
};
module.exports.ChargeSuccess = ChargeSuccess;

module.exports.ChargeCancel = async (req, res) => {
  res.send("Cancelled");
};
