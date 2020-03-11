// Stripe Secret Key
const stripeSecretKey = require('../startup/config').stripeKey();

// Stripe package installation
const stripe = require("stripe")(stripeSecretKey);

// ---------------------------------------------------
// Testing variables
const customerId = "cus_GpcoEM4aHSofi0";
// const cardToken = "tok_1GHxa0FRbrLkbntUNiXMLEH0";
// const cardSource = "card_1GHxa0FRbrLkbntUwiR2tCcs";
// const bankToken = "btok_1GHxa0FRbrLkbntUthXmhKB7";
// const bankSource = "ba_1GHxa0FRbrLkbntUtW7EPkHF";
// ---------------------------------------------------

// Creates a Customer and respond the customer object.
async function createCustomer(user) {
  var token;
  stripe.customers.create(
    {
      name: user.name,
      email: user.email,
      phone: user.phone
    },
    function(err, customer) {
      // asynchronously called
      console.log(customer);
      token = customer.id;
    }
  );
  return token;
}

// Creates a token using Card Info and prints the token object
function createCardToken() {
  stripe.tokens.create(
    {
      card: {
        number: "4242424242424242",
        exp_month: 3,
        exp_year: 2021,
        cvc: "314"
      }
    },
    function(err, token) {
      // asynchronously called
      console.log(token);
      return token;
      1;
    }
  );
}

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

// Links a token with a customer and prints the result
function createSource(customerId, token = "btok_1GHwo0FRbrLkbntUOEYfnTQp") {
  stripe.customers.createSource(
    customerId,
    {
      source: token
    },
    function(err, card) {
      // asynchronously called
      console.log(err);
      console.log(card);
      return card.id;
    }
  );
}

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

invoice();
