var stripe = require("stripe")("sk_test_dhqm4oXoschdPOpP5pdDlvyh00UhFz2zUC");

let registerCard = async (req, res) => {
  const account = await stripe.accounts.create({
    country: "US",
    type: "custom",
    requested_capabilities: ["card_payments", "transfers"],
    tos_acceptance: {
      date: Math.floor(Date.now() / 1000),
      ip: request.connection.remoteAddress
    }
  });
  console.log(account);
};

let currentBalance = async (req, res) => {
  stripe.balance.retrieve(
    {
      stripeAccount: "acct_1GGBOuGpDoZ6wHWR"
    },
    function(err, balance) {
      // asynchronously called
      console.log(balance);
    }
  );
};

let transferMoney = async (req, res) => {
  stripe.charges.create(
    {
      amount: 100,
      currency: "usd",
      source: "acct_1GGESYAR0IGtRxsq",
      description: "My First Test Charge (created for API docs)"
    },
    function(err, charge) {
      stripe.transfers.create(
        {
          amount: 100,
          currency: "usd",
          destination: "acct_1GGChvGKUcEM91B5"
        },
        function(err, transfer) {
          // asynchronously called
        }
      );
    }
  );
};

module.exports.registerCard = registerCard;
module.exports.currentBalance = currentBalance;
module.exports.transferMoney = transferMoney;
