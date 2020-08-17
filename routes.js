const routes = require('express').Router();
const { createClient } = require('./modules/twitter-client');
const { formValidate } = require('./modules/validator');
const { validationResult } = require('express-validator');
const { models, getOAuthMenfess } = require('./models');
const { model } = require('mongoose');
let Consumer = null;
let twitterClient = null;

routes.get('/', (req, res) => {
  res.render('index');
});

routes.get('/login', (req, res) => {
  res.render('login');
});

routes.post('/login', formValidate.login, (req, res) => {
  const backURL = req.header('Referer') || '/';
  const errors = validationResult(req);
  let errorsArray = [];

  // validate form
  if (!errors.isEmpty()) {
    errors.array().map(err => {
      errorsArray.push({ msg: `${err.msg}` });
    });
    req.flash('validationFailure', errorsArray);
    res.redirect(backURL);
  } else {
    models.Menfess.findOne(
      { menfessName: req.body.menfessName },
      (err, menfess) => {
        // validate data
        // console.log(menfess);
        if (menfess == null) {
          errorsArray.push({ msg: 'Menfess not found, please register' });
          req.flash('validationFailure', errorsArray);
          res.redirect(backURL);
        } else {
          // @ts-ignore
          if (!menfess.validPassword(req.body.password)) {
            errorsArray.push({ msg: 'Wrong password' });
            req.flash('validationFailure', errorsArray);
            res.redirect(backURL);
          } else {
            let sessionData = req.session;
            sessionData.consumerKey = menfess.consumerKey;
            sessionData.consumerSecret = menfess.consumerSecret;
            sessionData.accessToken = menfess.accessToken;
            sessionData.accessSecret = menfess.accessSecret;
            res.redirect('/home');
          }
        }
      }
    );
  }
});

routes.get('/register', (req, res) => {
  res.render('register');
});

routes.post('/register', formValidate.register, (req, res) => {
  const backURL = req.header('Referer') || '/';
  const errors = validationResult(req);
  let errorsArray = [];

  // check existing menfess
  models.Menfess.findOne(
    { menfessName: req.body.menfessName },
    (err, menfess) => {
      if (menfess != null) {
        errorsArray.push({ msg: `Menfess udah ada` });
        req.flash('validationFailure', errorsArray);
        res.redirect(backURL);
      }
    }
  );

  // validate form
  if (!errors.isEmpty()) {
    errors.array().map(err => {
      errorsArray.push({ msg: `${err.msg}` });
    });

    req.flash('validationFailure', errorsArray);
    res.redirect(backURL);
  } else {
    let sessionData = req.session;

    let consumerKey = req.body.consumerKey;
    let consumerSecret = req.body.consumerSecret;
    let menfessName = req.body.menfessName;

    sessionData.menfessName = menfessName;
    sessionData.consumerKey = consumerKey;
    sessionData.consumerSecret = consumerSecret;

    Consumer = getOAuthMenfess(consumerKey, consumerSecret);

    Consumer.getOAuthRequestToken(function (err, oauthToken, oauthTokenSecret) {
      if (err) {
        console.log(err);
        errorsArray.push({ msg: `Key is broken` });
        req.flash('validationFailure', errorsArray);
        res.redirect(backURL);
      } else {
        let newMenfess = new models.Menfess({
          menfessName,
          consumerKey,
          consumerSecret,
          isActive: true,
        });

        // @ts-ignore
        newMenfess.password = newMenfess.generateHash(req.body.password);
        newMenfess.save();

        sessionData.oauthRequestToken = oauthToken;
        sessionData.oauthRequestTokenSecret = oauthTokenSecret;

        res.redirect(
          'https://twitter.com/oauth/authorize?oauth_token=' + oauthToken
        );
      }
    });
  }
});

routes.get('/sessions/callback', (req, res) => {
  let sessionData = req.session;

  Consumer.getOAuthAccessToken(
    sessionData.oauthRequestToken,
    sessionData.oauthRequestTokenSecret,
    req.query.oauth_verifier,
    (err, oauthAccessToken, oauthAccessTokenSecret, results) => {
      if (err) {
        console.log('error callback', err);
        res.json(err);
      } else {
        sessionData.accessToken = oauthAccessToken;
        sessionData.accessSecret = oauthAccessTokenSecret;

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
    sessionData.accessToken,
    sessionData.accessSecret
  );

  twitterClient
    .get('account/verify_credentials', {
      skip_status: true,
    })
    .catch(function (err) {
      console.log('Home error:', err.stack);
    })
    .then(function (result) {
      res.json(result);
    });
});

module.exports = routes;
