// Modules
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
// Secrets
const { userJwt } = require("../../startup/config").jwtKeys()
// Models & Validators
const { Passengers,
    validatePassenger } = require("../../models/passengers-model");
const { validateLogin } = require("../../validators/signing-validators")
// Helpers & Services
const createStripeAccount = require('../../services/stripe').createCustomer
const { hashingPassword } = require("../../helpers/encryption-helper")
const sms = require("../../services/nexmo-sms")
    //---------------------
    /
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
        const customerToken = await createStripeAccount(_.pick(req.body, ["firstName", "lastName", "mail", "phone"]))

        // Organizig passenger object
        passenger.name = { first: passenger.firstName, last: passenger.lastName };
        passenger.stripeId = customerToken.id;
        passenger.pass = await hashingPassword(passenger.pass)
        passenger = _.pick(passenger, ["name", "mail", "pass", "passLength", "phone", "stripeId"])

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

    const passenger = await Passengers.findOne({ phone: req.body.phone })
    if (!passenger) return res.sendStatus(404)

    const code = parseInt(Math.random() * (999999 - 100000) + 100000).toString()
    await sms.sendVerificationCode(req.body.phone, code)

    // Respond with header token and code 
    const webToken = jwt.sign({ _id: passenger._id }, userJwt, { expiresIn: "1h" })
    res.header("x-temp-token", webToken).send(code)
}

module.exports.setNewPassword = async (req, res) => {

}