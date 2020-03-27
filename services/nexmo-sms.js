const {nexmoKey, nexmoSecret} = require("../startup/config").nexmoCredentials()
const Nexmo = require('nexmo');
const nexmo = new Nexmo({apiKey: nexmoKey, apiSecret: nexmoSecret});


module.exports.sendVerificationCode  = async function(receiver, code)
{
    nexmo.message.sendSms("Clax", "+2" + receiver,
     `رمز تفعيل حسابك هو: ${code}`, {"type": "unicode"}, (err, responseData) => {
        if (err) {
            throw new Error(err)
        } else {
            if(responseData.messages[0]['status'] === "0") {
                return true
            } else {
                throw new Error(`Message failed with error: ${responseData.messages[0]['error-text']}`);
            }
        }
    })  
}
