const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const session = require('express-session');
const port = 3000;
const routes = require('./routes');
const bodyParser = require('body-parser');
const mongoClient = require('mongodb').MongoClient;
const MongoStore = require('connect-mongo')(session);
const dbName = 'menfess_twitter';

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const CLUSTER = process.env.CLUSTER;

const url = `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER}-kdbqm.mongodb.net/test?retryWrites=true&w=majority`;

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
      url,
    }),
  })
);
app.set('view engine', 'pug');

mongoClient
  .connect(url, { useUnifiedTopology: true })
  .then(client => {
    const db = client.db(dbName);
    app.set('db', db);
    console.log('Connected to Database', db.databaseName);

    app.use('/', routes);
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running in ${port}`);
    });
  })
  .catch(console.error);
