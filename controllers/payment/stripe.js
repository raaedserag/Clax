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
  try {
    const cardToken = await stripe.tokens.create({ card: newCard });
    return { success: true, result: cardToken };
  } catch (error) {
    stripeDebugger(error.message);
    return { success: false, result: error.message };
  }
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
  try {
    const sourceToken = await stripe.customers.createSource(customerId, {
      source: token
    });
    return { success: true, result: sourceToken };
  } catch (error) {
    stripeDebugger(error.message);
    return { success: false, result: error.message };
  }
};

// Retreive all 3 cards (Maximum 3)
module.exports.getCards = async function(clientId) {
  try {
    const cardsQuery = await stripe.customers.listSources(clientId, {
      object: "card",
      limit: 3
    });
    return { success: true, result: cardsQuery };
  } catch (error) {
    stripeDebugger(error.message);
    return { success: false, result: error.message };
  }
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
  try {
    const charging = await stripe.charges.create({
      customer: charge.customerStripeId,
      amount: charge.amount,
      currency: "usd",
      source: charge.source
    });
    return { success: true, result: charging };
  } catch (error) {
    stripeDebugger(error.message);
    return { success: false, result: error.message };
  }
};

module.exports.updateCustomer = async function(customerId, updateParameters) {
  try {
    const updatingResult = await stripe.customers.update(
      customerId,
      updateParameters
    );
    return { success: true, result: updatingResult };
  } catch (error) {
    stripeDebugger(error.message);
    return { success: false, result: error.message };
  }
};
