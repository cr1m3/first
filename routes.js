const routes = require('express').Router();
// const Consumer = require('./modules/oauth-util');
// const { response } = require('express');
const { validateRegister } = require('./modules/validator');
const { validationResult } = require('express-validator');
const { models, getOAuthMenfess } = require('./models');
let Consumer = null;

routes.get('/', (req, res) => {
  res.render('index');
});

routes.get('/login', (req, res) => {
  res.render('login');
});

routes.post('/login/callback', validateRegister, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { menfess_name, password, consumer_key, consumer_secret } = req.body;
  res.send({ msg: { menfess_name, password, consumer_key, consumer_secret } });
});

routes.get('/register', (req, res) => {
  if (req.session.menfessName != undefined) {
    res.redirect('/home');
  }
  res.render('register');
});

routes.post('/register/callback', (req, res) => {
  let sessionData = req.session;

  let consumerKey = req.body.consumer_key;
  let consumerSecret = req.body.consumer_secret;
  let menfessName = req.body.menfess_name;
  let password = 'test';

  sessionData.menfessName = menfessName;

  models.Menfess.create(
    { menfessName, consumerKey, consumerSecret, password },
    function (err, results) {
      if (err) {
        console.log(err);
      }
    }
  );

  Consumer = getOAuthMenfess(consumerKey, consumerSecret);

  Consumer.getOAuthRequestToken(function (err, oauthToken, oauthTokenSecret) {
    if (err) {
      console.log(err);
    } else {
      sessionData.oauthRequestToken = oauthToken;
      sessionData.oauthRequestTokenSecret = oauthTokenSecret;

      res.redirect(
        'https://twitter.com/oauth/authorize?oauth_token=' + oauthToken
      );
    }
  });
});

routes.get('/sessions/callback', (req, res) => {
  let sessionData = req.session;
  console.log(sessionData);

  Consumer.getOAuthAccessToken(
    sessionData.oauthRequestToken,
    sessionData.oauthRequestTokenSecret,
    req.query.oauth_verifier,
    (err, oauthAccessToken, oauthAccessTokenSecret, results) => {
      if (err) {
        console.log('error callback', err);
        res.json(err);
      } else {
        sessionData.oauthAccessToken = oauthAccessToken;
        sessionData.oauthAccessTokenSecret = oauthAccessTokenSecret;

        const filter = { menfessName: sessionData.menfessName };
        const update = {
          accessToken: oauthAccessToken,
          accessSecret: oauthAccessTokenSecret,
          hehe: 'asdasdasdsa',
        };

        let data = models.Menfess.findOneAndUpdate(filter, update, function (
          err,
          doc
        ) {
          if (err) {
            console.log(err);
          } else {
            console.log(doc);
          }
        });

        console.log(`Success add new menfess ${data}`);

        res.redirect('/home');
      }
    }
  );
});

routes.get('/home', (req, res) => {
  try {
    Consumer.get(
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
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

module.exports = routes;
