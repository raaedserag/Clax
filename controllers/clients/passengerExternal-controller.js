// Models
const { Passengers } = require("../../models/passengers-model");
// Helpers
const { decodeId } = require("../../helpers/encryption-helper")


module.exports.verifyPassengerMail = async (req, res) => {
    // Decode passenger id
    const userId = decodeId(req.params.id)
    // Check if mail is already verified
    const check = await Passengers.findById(userId).select('-_id mail_verified')
    if (check.mail_verified) return res.sendStatus(409)

    await Passengers.findByIdAndUpdate(userId, { mail_verified: true })
    return res.send("Done")
}