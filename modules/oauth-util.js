const oauth = require('oauth');

class Consumer {
  constructor() {
    this.consumer = null;
    this.oauthRequestToken = null;
    this.oauthRequestTokenSecret = null;
  }

  createConsumer = (consumer_key, consumer_secret) => {
    const consumer = new oauth.OAuth(
      'https://twitter.com/oauth/request_token',
      'https://twitter.com/oauth/access_token',
      consumer_key,
      consumer_secret,
      '1.0A',
      'https://menfess-mtt-login.herokuapp.com/sessions/callback',
      'HMAC-SHA1'
    );

    this.consumer = consumer;
  };
}

module.exports = Consumer;
