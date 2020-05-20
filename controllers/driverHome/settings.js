// Models
const { Drivers } = require("../../models/drivers-model");

// Helpers
const sms = require("../../services/nexmo-sms");
const { validateUpdateMe } = require("../../validators/settings-validator");
const {
    hashing
  } = require("../../helpers/encryption-helper");

// Get driver info
module.exports.getMe = async (req, res) => {
    const driver = await Drivers.findById("5e5690b3e781d4395c633b44").select(
      "-_id name mail phone pass passLength phone_verified mail_verified"
    );
    return res.send(driver);
  };

// Update driver info
module.exports.updateMe = async (req, res) => {
    
    // Validate update reuest
    const { error, value } = validateUpdateMe(req.body);
    if (error) return res.status(404).send(error.details[0].message);
    let request = value;

    // Format update request
    if (request.mail) request.mail_verified = false;
    if (request.phone) request.phone_verified = false;
    if (request.pass) request.pass = await hashing(request.pass);

    if (request.firstName) {
    let name = {};
    name.first = request.firstName;
    name.last = request.lastName;
    delete request.lastName;
    delete request.firstName;
    request.name = name;
    }

    await Drivers.findByIdAndUpdate("5e5690b3e781d4395c633b44", request);

    return res.sendStatus(200);
    };