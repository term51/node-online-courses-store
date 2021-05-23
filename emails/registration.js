const keys = require('../keys');

module.exports = function (to) {
   return {
      from: keys.EMAIL_FROM,
      to: to,
      subject: 'Success registration',
      text: 'This message was sent from Node js server.',
      html: `
         <h1>Welcome to our shop</h1>
         <p>You have successfully registered on our online course sales platform.</p>
         <hr/>
         <a href="${keys.BASE_URL}">Our website</a>
      `,
   };
};
