const moongose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const oauth = require('oauth');
const dotenv = require('dotenv');
dotenv.config();

const HEROKU_URL = process.env.HEROKU_URL;

const menfessSchema = new moongose.Schema(
  {
    menfessName: String,
    consumerKey: String,
    consumerSecret: String,
    accessToken: String,
    accessSecret: String,
    isActive: Boolean,
    password: String
  },
  { collection: 'menfess_credentials' }
);

menfessSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

menfessSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const Menfess = moongose.model('Menfess', menfessSchema);

const getOAuthMenfess = (consumerKey, consumerSecret) =>
  new oauth.OAuth(
    'https://twitter.com/oauth/request_token',
    'https://twitter.com/oauth/access_token',
    consumerKey,
    consumerSecret,
    '1.0A',
    HEROKU_URL,
    'HMAC-SHA1'
  );

module.exports = { Menfess, getOAuthMenfess };
