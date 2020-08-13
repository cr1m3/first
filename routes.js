const routes = require('express').Router();
const Consumer = require('./modules/oauth-util');
const { response } = require('express');
const c = new Consumer();

routes.get('/', (req, res) => {
  res.render('index');
});

routes.get('/login', (req, res) => {
  res.render('login');
});

routes.post('/login/callback', (req, res) => {
  let consumer_key = req.body.consumer_key;
  let consumer_secret = req.body.consumer_secret;

  const db = req.app.get('db');
  
  db.collection('menfess_credentials')
    .insertOne({ menfess_name: 'fadhlu', consumer_key, consumer_secret })
    .then(result => {
      console.log('Success writing data');
    })
    .catch(err => {
      console.log(err);
    });

  c.createConsumer(consumer_key, consumer_secret);

  c.consumer.getOAuthRequestToken(function (err, oauthToken, oauthTokenSecret) {
    if (err) {
      console.log(err);
    } else {
      c.oauthRequestToken = oauthToken;
      c.oauthRequestTokenSecret = oauthTokenSecret;
      console.log(req.session, 'in login/callback');
      res.redirect(
        'https://twitter.com/oauth/authorize?oauth_token=' + oauthToken
      );
    }
  });
});

routes.get('/sessions/callback', (req, res) => {
  console.log(req.session, 'in sessions/callback');

  c.consumer.getOAuthAccessToken(
    c.oauthRequestToken,
    c.oauthRequestTokenSecret,
    // @ts-ignore
    req.query.oauth_verifier,
    (err, oauthAccessToken, oauthAccessTokenSecret, results) => {
      if (err) {
        console.log('error callback', err);
        res.json(err);
      } else {
        req.session.oauthAccessToken = oauthAccessToken;
        req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;

        const db = req.app.get('db');
        db.collection('menfess_credentials')
          .findOneAndUpdate(
            { menfess_name: 'fadhlu' },
            {
              $set: {
                access_token: oauthAccessToken,
                access_secret: oauthAccessTokenSecret,
              },
            },
            {
              upsert: true,
            }
          )
          .then(result => {
            console.log('Success updating data');
          })
          .catch(err => {
            console.log(err);
          });

        res.redirect('/home');
      }
    }
  );
});

routes.get('/home', (req, res) => {
  c.consumer.get(
    'https://api.twitter.com/1.1/account/verify_credentials.json',
    req.session.oauthAccessToken,
    req.session.oauthAccessTokenSecret,
    (err, data, response) => {
      if (err) {
        res.json({ msg: err });
      } else {
        // @ts-ignore
        let parsedData = JSON.parse(data);
        res.send('You are signed in: ' + parsedData.screen_name);
      }
    }
  );
});

module.exports = routes;
