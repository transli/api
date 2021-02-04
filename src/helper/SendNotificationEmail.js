const Mail = require('../lib/Mail');

class SendNotificationEmail {
  get key () {
    return 'SendNotificationEmail';
  };

  async handle({data}){
  if(typeof data === 'undefined'){
    return false;
  }
    return Mail.sendEmail({
      from: "Translite Car-Sharing <info@translite.online>",
      to: `<${data.email}>`,
      subject: data.sub,
      template: 'notifications_email',
      context: {
        user: data.name,
        message: data.message,
        subMsg: data.subMsg,
      },
    });
  
  };

};

module.exports = new SendNotificationEmail();
