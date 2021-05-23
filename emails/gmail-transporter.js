const nodemailer = require('nodemailer');

module.exports = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: 'terminaktermail@gmail.com',
      pass: '@TerM212228',
   },
   tls: {
      rejectUnauthorized: false
   }
});
