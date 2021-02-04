require('../bootstrap');
const nodemailer = require('nodemailer');
const { resolve } = require('path');
const nodemailerhbs = require('nodemailer-express-handlebars');
const exphbs = require('express-handlebars');
const mailConfig = require('../config/email-config');

class Mail {
  constructor() {
    this.transporter = nodemailer.createTransport({
      pool: true,
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      },
    });

    this.configureTemplates();
  }

  // mail templates
  configureTemplates() {
    const viewPath = resolve(__dirname, '..', 'views', 'emails');

    // Configuring the way that the message will be formatted
    this.transporter.use(
      'compile',
      // Defining the view engine configurations - Choosed: Handlebars
      nodemailerhbs({
        viewEngine: exphbs.create({
          layoutsDir: resolve(viewPath, 'layouts'),
          partialsDir: resolve(viewPath, 'partials'),
          defaultLayout: 'default',
          extname: '.hbs',
        }),
        viewPath,
        extName: '.hbs',
      })
    );
  }

  // Message object -> All the data expected from the template
  sendEmail(message) {
    return this.transporter.sendMail(
      {
        ...mailConfig.default,
        ...message,
      },
      (err, info) => {
        if (err) return console.log('err', err);

        return console.log('info', info);
      }
    );
  }
}

module.exports= new Mail();