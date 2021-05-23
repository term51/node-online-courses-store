const {Router} = require('express');
const router = Router();
const routeProtector = require('../middleware/auth');
const Order = require('../models/order');

router.get('/',routeProtector, async (req, res) => {
   try {
      const orders = await Order.find({
         'user.userId': req.user._id
      }).populate('user.userId').lean();
      res.render('orders', {
         isOrders: true,
         title: 'Orders',
         orders: orders.map(order => {
            return {
               ...order,
               price: order.courses.reduce((total, course) => {
                  return total += course.count * course.course.price;
               }, 0)
            };
         })
      });
   } catch (e) {
      console.log(e);
   }
});

router.post('/',routeProtector, async (req, res) => {
   try {
      const user = await req.user
         .populate('cart.items.courseId')
         .execPopulate();
      const courses = user.cart.items.map(i => ({
         count: i.count,
         course: {...i.courseId._doc}
      }));

      const order = new Order({
         user: {
            name: req.user.name,
            userId: req.user
         },
         courses
      });
      await order.save();
      await req.user.clearCart();

      res.redirect('/orders');
   } catch (e) {
      console.log(e);
   }
});

module.exports = router;