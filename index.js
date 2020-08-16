const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const port = 3000;
const routes = require('./routes');
const bodyParser = require('body-parser');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const { connectDb } = require('./models');
const dotenv = require('dotenv');
const flash = require('connect-flash');

dotenv.config();

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const CLUSTER = process.env.CLUSTER;
const DB_NAME = process.env.DB_NAME;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    name: 'api keys',
    secret: 'SECRET',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    store: new MongoStore({
      url: `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER}-kdbqm.mongodb.net/${DB_NAME}`,
    }),
  })
);
app.use(flash())
app.use((req, res, next) => {
  res.locals.validationFailure = req.flash('validationFailure')
  next()
})

app.set('view engine', 'pug');
app.set('views', path.join(__dirname + '/public/views'));

connectDb().then(async () => {
  app.use('/', routes);
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running in ${port}`);
  });
});
