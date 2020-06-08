const bcrypt = require("bcrypt");
const _ = require("lodash");
// Configuration & Secrets
const { host, port } = require("../../startup/config").serverConfig();
// Models & Validators
const { Drivers } = require("../../models/drivers-model");

module.exports.driverInfo = async (req, res) => {
  const driver = await Drivers.findById(req.user._id)
    .populate("_cars", "color plateNumber")
    .select("-_id name phone profilePic _cars");
  console.log(driver);
  return res.send(driver);
};
