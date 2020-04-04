// SendGrid Module
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(require('../startup/config').sendGridKey());
//-----------------

module.exports.sendVerificationCode = async function(receiver, data)
{
    const response = await sgMail.send({
        from: "Clax-Team@claxapp.com",
        templateId: 'd-af942102c2484724b05b12669d3bb727',
        dynamic_template_data: {
          customer: data.firstName,
          url: data.link,
          code: data.code,
        },
        personalizations:
        [{
          to: receiver
        }]
      })
      return response
}
