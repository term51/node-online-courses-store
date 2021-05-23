const {Router} = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const {validationResult} = require('express-validator/check');
const {registerValidators} = require('../utils/validators');

const router = Router();
const User = require('../models/user');

const resetEmail = require('../emails/reset');
const regEmail = require('../emails/registration');
const mailTransporter = require('../emails/gmail-transporter');

router.get('/login', async (req, res) => {
   res.render('auth/login', {
      title: 'Authorization',
      isLogin: true,
      loginError: req.flash('loginError'),
      registerError: req.flash('registerError')
   });
});

router.get('/logout', async (req, res) => {
   req.session.destroy(() => {
      res.redirect('/auth/login#login');
   });
});

router.post('/login', async (req, res) => {
   try {
      const {email, password} = req.body;
      const candidate = await User.findOne({email});
      if (candidate) {
         const areSame = await bcrypt.compare(password, candidate.password);
         if (areSame) {
            req.session.user = candidate;
            req.session.isAuthenticated = true;
            req.session.save(err => {
               if (err) {
                  throw err;
               } else {
                  res.redirect('/');
               }
            });
         } else {
            req.flash('loginError', 'Incorrect password');
            res.redirect('/auth/login#login');
         }
      } else {
         req.flash('loginError', 'The user does not exist.');
         res.redirect('/auth/login#login');
      }
   } catch (e) {
      console.log(e);
   }
});

router.post('/register', registerValidators, async (req, res) => {
   try {
      const {email, password, name} = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         req.flash('registerError', errors.array()[0].msg);
         return res.status(422).redirect('/auth/login#register');
      }

      const hashPassword = await bcrypt.hash(password, 10);
      const user = new User({
         email, name, password: hashPassword, cart: {items: []}
      });
      await user.save();

      await mailTransporter.sendMail(regEmail(email));

      res.redirect('/auth/login#login');

   } catch (e) {
      console.log(e);
   }
});

router.get('/reset', (req, res) => {
   res.render('auth/reset', {
      title: 'Forgot password',
      error: req.flash('error')
   });
});

router.post('/reset', (req, res) => {
   try {
      crypto.randomBytes(32, async (err, buffer) => {
         if (err) {
            req.flash('error', 'Something went wrong, try again later.');
            return res.redirect('/auth/reset');
         }

         const token = buffer.toString('hex');
         const candidate = await User.findOne({email: req.body.email});
         if (candidate) {
            candidate.resetToken = token;
            candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
            await candidate.save();
            await mailTransporter.sendMail(resetEmail(candidate.email, token));
            res.redirect('/auth/login');
         } else {
            req.flash('error', 'Email not exist');
            res.redirect('/auth/reset');
         }
      });
   } catch (e) {
      console.log(e);
   }
});

router.get('/password/:token', async (req, res) => {

   if (!req.params.token) {
      req.flash('loginError', 'The token param is empty.');
      return res.redirect('/auth/login');
   }

   try {
      const user = await User.findOne({
         resetToken: req.params.token,
         resetTokenExp: {$gt: Date.now()}
      });

      if (!user) {
         req.flash('loginError', 'The token not found.');
         return res.redirect('/auth/login');
      } else {
         res.render('auth/password', {
            title: 'Restore password',
            error: req.flash('error'),
            userId: user._id.toString(),
            token: req.params.token
         });
      }
   } catch (e) {
      console.log(e);
   }
});

router.post('/password', async (req, res) => {
   try {
      const user = await User.findOne({
         _id: req.body.userId,
         resetToken: req.body.token,
         resetTokenExp: {$gt: Date.now()}
      });

      if (user) {
         user.password = await bcrypt.hash(req.body.password, 10);
         user.resetToken = undefined;
         user.resetTokenExp = undefined;
         await user.save();
         res.redirect('/auth/login');
      } else {
         req.flash('error', 'The token\'s lifetime has expired.');
         res.redirect('/auth/login');
      }

   } catch (e) {
      console.log(e);
   }
});


module.exports = router;