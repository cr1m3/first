const Twit = require('twit');

const createClient = (consumerKey, consumerSecret, accessToken, accessSecret) =>
  new Twit({
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    access_token: accessToken,
    access_token_secret: accessSecret,
  });

module.exports = { createClient };
