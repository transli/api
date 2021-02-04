const { countBy } = require('lodash');
const Mail = require('../lib/Mail');

class SendEmailsToMany {
  // Returning a unique key
  get key() {
    return 'SendEmailsToMany';
  }

  async handle(data){
    if(typeof data === 'undefined'){
      return false;
    }

    const emails = ['translite9@gmail.com, bizz.john@yahoo.com'];
    const promises = [];
    for (let i = 0; i < emails.length; i++) {
      promises.push(new Promise(function(resolve, reject){
        return Mail.sendEmail({
          from: "Admin <info@translite.online>",
          to: emails[i],
          subject: 'Your help order was answered',
          template: 'notifications_email',
          context: {
            user: data.name,
            message: data.message
          },
        }); 
      }));
    }
    Promise.all(promises).then(function(infos){cb (null, infos)}, function(err) {cb (err)});
  };

}

module.exports = new SendEmailsToMany();
