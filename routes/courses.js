const {Router} = require('express');
const Course = require('../models/course');
const router = Router();
const routeProtector = require('../middleware/auth');
const {courseValidators} = require('../utils/validators');
const {validationResult} = require('express-validator/check');
router.get('/', async (req, res) => {
   try {
      const courses = await Course.find()
         .populate('userId', 'email name')
         .lean();

      res.render('courses', {
         title: 'Courses',
         isCourses: true,
         userId: req.user ? req.user._id.toString() : null,
         courses
      });
   } catch (e) {
      console.log(e);
   }
});

function isOwner(course, req) {
   return course.userId.toString() === req.user._id.toString();
}

router.get('/:id/edit', routeProtector, async (req, res) => {
   if (!req.query.allow) {
      return res.redirect('/');
   }

   try {
      const course = await Course.findById(req.params.id).lean();
      if (!isOwner(course, req)) {
         return res.redirect('/courses');
      }

      res.render('course-edit', {
         title: `Edit ${course.title}`,
         course
      });
   } catch (e) {
      console.log(e);
   }
});

router.post('/edit', routeProtector, courseValidators, async (req, res) => {
   const {id} = req.body;
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      return res.status(422).redirect(`/courses/${id}/edit?allow=true`);
   }

   try {
      delete req.body.id;
      const course = await Course.findById(id);
      if (!isOwner(course, req)) {
         return res.redirect('/courses');
      }

      await Course.findByIdAndUpdate(id, req.body);
      res.redirect('/courses');
   } catch (e) {
      console.log(e);
   }
});

router.post('/remove', routeProtector, async (req, res) => {
   try {
      await Course.deleteOne({
         _id: req.body.id,
         userId: req.user._id
      });
      res.redirect('/courses');
   } catch (e) {
      console.log(e);
   }
});

router.get('/:id', async (req, res) => {
   try {
      const {isValidObjectId} = require('mongoose');
      if (!isValidObjectId(req.params.id)) {
         res.status(400);
         return res.end('Incorrect id');
      }

      const course = await Course.findById(req.params.id).lean();
      res.render('course', {
         layout: 'empty',
         title: `Course ${course.title}`,
         course
      });
   } catch (e) {
      console.log(e);
   }
});

module.exports = router;