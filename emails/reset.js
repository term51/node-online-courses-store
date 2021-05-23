const keys = require('../keys');

module.exports = function (email, token) {
   return {
      from: keys.EMAIL_FROM,
      to: email,
      subject: 'Restore access.',
      text: 'This message was sent from Node js server.',
      html: `
         <h1>Restore password</h1>
         <p>Your password recovery <a href="${keys.BASE_URL}/auth/password/${token}">link.</a></p>
      `,
   };
};
