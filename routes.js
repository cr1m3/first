const routes = require('express').Router();
const { createClient } = require('./modules/twitter-client');
const { validateRegister } = require('./modules/validator');
const { validationResult } = require('express-validator');
const { models, getOAuthMenfess } = require('./models');
let Consumer = null;
let twitterClient = null;

routes.get('/', (req, res) => {
  res.render('index');
});

routes.get('/login', (req, res) => {
  res.render('login');
});

routes.post('/login/callback', (req, res) => {
  models.Menfess.findOne({ menfessName: req.body.menfessName }, (err, menfess) => {
    // @ts-ignore
    if (!menfess.validPassword(req.body.password)) {
      console.log(err);
    } else {
      res.redirect('/home')
    }
  })
});

routes.get('/register', (req, res) => {
  res.render('register');
});

routes.post('/register/callback', validateRegister, (req, res) => {
  let sessionData = req.session;

  let consumerKey = req.body.consumer_key;
  let consumerSecret = req.body.consumer_secret;
  let menfessName = req.body.menfess_name;

  sessionData.menfessName = menfessName;
  sessionData.consumerKey = consumerKey;
  sessionData.consumerSecret = consumerSecret;

  let newMenfess = new models.Menfess({
    menfessName,
    consumerKey,
    consumerSecret,
    isActive: true,
  });

  // @ts-ignore
  newMenfess.password = newMenfess.generateHash(req.body.password);
  newMenfess.save();

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
  let sessionData = req.session;

  //create object twitterClient
  twitterClient = createClient(
    sessionData.consumerKey,
    sessionData.consumerSecret,
    sessionData.oauthAccessToken,
    sessionData.oauthAccessTokenSecret
  );

  twitterClient
    .get('account/verify_credentials', {
      skip_status: true,
    })
    .catch(function (err) {
      console.log('caught error', err.stack);
    })
    .then(function (result) {
      console.log('data', result.data);
      res.json(result);
    });
});

module.exports = routes;
