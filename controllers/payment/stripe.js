// Setup Error Debugger
const stripeDebugger = require("debug")("Clax:stripeController");
// Stripe Secret Key
const stripeSecretKey = require("../../startup/config").stripeKey();
// Stripe package installation
const stripe = require("stripe")(stripeSecretKey);

// ---------------------------------------------------
// Testing variables
// const cardToken = "tok_1GHxa0FRbrLkbntUNiXMLEH0";
// const cardSource = "card_1GHxa0FRbrLkbntUwiR2tCcs";
// const bankToken = "btok_1GHxa0FRbrLkbntUthXmhKB7";
// const bankSource = "ba_1GHxa0FRbrLkbntUtW7EPkHF";
// ---------------------------------------------------

// Creates a Customer and return the customer object.
module.exports.createCustomer = function(user) {
  if (!(user.name.first && user.name.last && user.mail && user.phone)) {
    return { message: "invalid user object" };
  }

  stripe.customers.create(
    {
      name: user.name.first.concat(" ", user.name.last),
      email: user.mail,
      phone: user.phone
    },
    function(err, customer) {
      if (err) return err;
      return customer;
    }
  );
};

// Creates a token using Card Info and returns the token object
module.exports.createCardToken = async function(newCard) {

  return await stripe.tokens.create({ card: newCard });
};

// Creates a token using Bank Account Info and prints the token object
function createBankToken() {
  stripe.tokens.create(
    {
      bank_account: {
        country: "US",
        currency: "usd",
        account_holder_name: "Jenny Rosen",
        account_holder_type: "individual",
        routing_number: "110000000",
        account_number: "000123456789"
      }
    },
    function(err, token) {
      // asynchronously called
      console.log(token);
      //   return token;
    }
  );
}

// Links a token with a customer and returns the source object
module.exports.createSource = async function(customerId, token) {
  return await stripe.customers.createSource(customerId, {source: token});
};

module.exports.removeSource = async function(customerId, source) {

  const sourceRemoved = await stripe.customers.deleteSource(
    customerId,
    source
  );
  return sourceRemoved.deleted

};

// Retreive all 3 cards (Maximum 3)
module.exports.getCards = async function(clientId) {

  return await stripe.customers.listSources(clientId, {
    object: "card",
    limit: 3
  });

};

// Updates user's balance manually
function updateBalance(amountt) {
  stripe.customers.retrieve(customerId, function(err, customer) {
    // asynchronously called
    console.log(customer.balance);
    stripe.customers.update(
      customerId,
      { balance: customer.balance + amountt * -1 },
      function(err, customer) {
        // asynchronously called
        console.log(customer.balance);
        return customer.balance;
      }
    );
  });
}

// Creates an Invoice using customerID and specific amount.
async function invoice() {
  await stripe.invoiceItems.create({
    customer: customerId,
    amount: 2500,
    currency: "usd",
    description: "One-time setup fee"
  });

  stripe.invoices.create(
    {
      customer: customerId,
      auto_advance: false // auto-finalize this draft after ~1 hour
    },
    function(err, result) {
      stripe.invoices.finalizeInvoice(result.id, function(err, invoice) {
        // asynchronously called
        console.log(invoice.id);
      });
    }
  );
}

module.exports.chargeBalance = async function(charge) {

  await stripe.charges.create({
    customer: charge.customerStripeId,
    amount: charge.amount * 100,
    currency: "usd",
    source: charge.source
  });

  // Retrieving Customer's current Balance
  const retreivedBalance = await stripe.customers.retrieve(
    charge.customerStripeId
  );

  const updateBalance = await stripe.customers.update(
    charge.customerStripeId,
    {
      balance: retreivedBalance.balance - charge.amount * 100
    }
  );
  return updateBalance.balance / 100 ;

};

module.exports.updateCustomer = async function(customerId, updateParameters) {

  return await stripe.customers.update(
    customerId,
    updateParameters
  );
  
};
