// Models
const { Drivers } = require("../../models/drivers-model");

// Helpers

// Get main home info
module.exports.main = async (req, res) => {
    const data = await Drivers.findById("5e5690b3e781d4395c633b44").select(
      "-_id rate status.is_available img"
    );
    return res.send(data);
  };
