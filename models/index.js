const mongoose = require('mongoose');
const { Menfess, getOAuthMenfess } = require('./menfess');
const dotenv = require('dotenv');

dotenv.config();

mongoose.set('useFindAndModify', false);

const NODE_ENV = process.env.NODE_ENV;
let url = '';

if (NODE_ENV == 'development') {
  url = `mongodb://localhost:27017/menfess_twitter`;
} else {
  const USERNAME = process.env.USERNAME;
  const PASSWORD = process.env.PASSWORD;
  const CLUSTER = process.env.CLUSTER;
  const DB_NAME = process.env.DB_NAME;
  url = `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER}-kdbqm.mongodb.net/${DB_NAME}`;
}

const connectDb = () => {
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const models = { Menfess };

module.exports = { models, connectDb, getOAuthMenfess };
