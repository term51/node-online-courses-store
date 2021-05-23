const {body} = require('express-validator/check');
const User = require('../models/user');
exports.registerValidators = [
   body('email')
      .isEmail()
      .withMessage('Enter correct email')
      .custom(async (value, {req}) => {
         try {
            const user = await User.findOne({email: value});
            if (user) return Promise.reject('User with this email already exists.');
         } catch (e) {
            console.log(e);
         }
      }).normalizeEmail(),
   body('password', 'Password must be between 6 and 56 symbols and consist of letters and numbers')
      .isLength({min: 6, max: 56})
      .isAlphanumeric()
      .trim(),
   body('confirm')
      .custom((value, {req}) => {
         if (value !== req.body.password) throw new Error('Passwords must match');
         return true;
      })
      .trim(),
   body('name')
      .isLength({min: 3})
      .withMessage('Name must be minimum 3 symbols')
      .trim()
];

exports.courseValidators = [
   body('title').isLength({min: 3}).withMessage('Minimum name length is 3 symbols').trim(),
   body('price').isNumeric().withMessage('Enter correct price'),
   body('img', 'Enter correct URL of image').isURL()
];