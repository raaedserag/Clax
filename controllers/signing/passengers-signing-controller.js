const bcrypt = require("bcrypt");
const _ = require("lodash");
// Models & Validators
const { Passengers,
    validatePassenger } = require("../../models/passengers-model");
const { validateLogin } = require("../../validators/signing-validators")
// Helpers & Services
const createStripeAccount = require('../../services/stripe').createCustomer
const { hashingPassword } = require("../../helpers/encryption-helper")
//---------------------


// Sign-up
module.exports.passengerSignUp = async (req, res) => {
    //check if the passenger information is valid.
    let { error, value } = validatePassenger(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let passenger = value;

    // check if user with the same email already registered.
    error = await Passengers.findOne({ mail: req.body.mail });
    if (error) return res.status(409).send("email already exists.");

    // check if user with the same phone number already registered.
    error = await Passengers.findOne({ phone: req.body.phone });
    if (error) return res.status(409).send("Phone number already exists.");

    // Creating Stripe account for the registered user
    const customerToken = await createStripeAccount(_.pick(req.body, ["name", "mail", "phone"]))

    // Organizig passenger object
    passenger.name = { first: passenger.firstName, last: passenger.lastName };
    passenger.stripeId = customerToken.id;
    passenger.pass = hashingPassword(passenger.pass)
    passenger = _.pick(req.body, ["name", "mail", "pass", "passLength", "phone", "stripeId"])

    //save user to the database.
    passenger = new Passengers(passenger)
    await passenger.save();

    //create web token and sends it to the user as an http header.
    const webToken = passenger.generateToken("96h");

    //pick what you want to send to the user (using lodash).
    res.header("x-login-token", webToken).sendStatus(200);
};

// Sign-in
module.exports.passengerSignIn = async (req, res) => {
    //Validate the data of user
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Checkin if the email exists
    let passenger = await Passengers.findOne({ mail: req.body.mail });
    if (!passenger) return res.status(400).send("Email does not exist.");
    if (!passenger.mail_verified) return res.status(402).send("This mail hasn't been activated yet")
    //Checkin if Password is correct
    const validPassword = await bcrypt.compare(req.body.pass, passenger.pass);
    if (!validPassword) return res.status(400).send("Invaild password.");

    //Create token, expires within 5 hours.
    const webToken = passenger.generateToken("96h");
    res.send(webToken);
};

module.exports.passengerForgottenPass = async (req, res) => {

}
