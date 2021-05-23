const express = require('express');
const path = require('path');
const keys = require('./keys');
const app = express();

const compression = require('compression');

const helmet = require('helmet');
const csurf = require('csurf');

const flash = require('connect-flash');

const homeRoutes = require('./routes/home');
const cartRoutes = require('./routes/cart');
const addRoutes = require('./routes/add');
const coursesRoutes = require('./routes/courses');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const errorHandler = require('./middleware/error');
const fileMiddleware = require('./middleware/file');

const exphbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);

const store = new MongoStore({
   collection: 'sessions',
   uri: keys.MONGODB_URI
});

const hbs = exphbs.create({
   defaultLayout: 'main',
   extname: 'hbs',
   helpers: require('./utils/hbs-helpers')
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({extended: true}));

app.use(session({
   secret: keys.SESSION_SECRET,
   resave: false,
   saveUninitialized: false,
   store
}));

app.use(fileMiddleware.single('avatar'));

app.use(csurf());
app.use(flash());
app.use(compression());
app.use(helmet({
   contentSecurityPolicy: false,
}));

app.use(varMiddleware);
app.use(userMiddleware);

app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/add', addRoutes);
app.use('/courses', coursesRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/profile', profileRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const mongoose = require('mongoose');

async function start() {
   try {
      await mongoose.connect(keys.MONGODB_URI, {
         useNewUrlParser: true,
         useUnifiedTopology: true,
         useFindAndModify: false
      });

      app.listen(PORT, () => {
         console.log(`Server is running on port ${PORT}`);
      });
   } catch (e) {
      console.log(e);
   }
}

start();




