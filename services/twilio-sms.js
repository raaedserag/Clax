const {sid, token, number} = require('../startup/config').twilioCredentials()
const twilioClient = require('twilio')(sid, token);



module.exports.sendVerificationCode = async function(receiver, code)
{
    return await twilioClient.messages
    .create({
        body: `Your confirmation code for Clax account is: ${code}`,
        from: number,
        to: receiver
    })
}
