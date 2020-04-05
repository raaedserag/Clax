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
const {validatePaypalRequest} = require("../../validators/manage-financials-validators");





paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:paypalId,
  client_secret:paypalSecret
});

let ChargeOgra = async function (req, res)  {

try{
  
//encryprion User id
  const encryptId=encryption.encodeId(req.body._passenger);
//create payment object
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
  //validate charged amount
  validateObject={
    amount:req.body.amount

  }
  const { error } = validatePaypalRequest( validateObject)
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
}catch(error){ res.status(400).send("Invalid Data.");}


}

module.exports.ChargeOgra = ChargeOgra;

let ChargeSuccess = async function (req, res)  {
  let session=null;
  

  try{
  //Start Transaction
  session=await startTransaction();
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
    
      addedBalance= parseInt(req.params.amount);
      await Passengers.updateOne(
        { _id:decryptId},
        { $inc: { balance: addedBalance } 
      },{session});
      var confirmedPayment = {
        amount: parseInt(req.params.amount),
        description: "Paypal",
        type: "Charge",
        _passenger: decryptId
      };
    //Save payment in DB on success
    confirmedPayment = new Payments(confirmedPayment);
    confirmedPayment = await confirmedPayment.save();
    await session.commitTransaction();
    res.send(confirmedPayment);
    }
  });
}catch(error){
  await session.abortTransaction();
  throw new Error("Tranaction Faild !\n" + error.message )
}
}
module.exports.ChargeSuccess = ChargeSuccess;

module.exports.ChargeCancel = async (req, res) => { res.send("Cancelled"); };
