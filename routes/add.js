const {Router} = require('express');
const router = Router();
const routeProtector = require('../middleware/auth');
const {validationResult} = require('express-validator/check');
const {courseValidators} = require('../utils/validators');
const Course = require('../models/course');

router.get('/', routeProtector, (req, res) => {
   res.render('add', {
      title: 'Add a course',
      isAdd: true
   });
});

router.post('/', routeProtector, courseValidators, async (req, res) => {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      return res.status(422).render('add', {
         title: 'Add a course',
         isAdd: true,
         error: errors.array()[0].msg,
         data:{
            title: req.body.title,
            price: req.body.price,
            img: req.body.img
         }
      });
   }

   const course = new Course({
      title: req.body.title,
      price: req.body.price,
      img: req.body.img,
      userId: req.user._id
   });

   try {
      await course.save();
      res.redirect('/courses');
   } catch (e) {
      console.log(e);
   }
});
module.exports = router;