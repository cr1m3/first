const { models, getOAuthMenfess } = require('../models');
const { validationResult } = require('express-validator');
let Consumer = null;

const getRegister = (req, res) => {
  res.render('register');
};

const postRegister = (req, res) => {
  const backURL = req.header('Referer') || '/';
  const errors = validationResult(req);
  let errorsArray = [];

  // check existing menfess
  models.Menfess.findOne(
    { menfessName: req.body.menfessName },
    (err, menfess) => {
      if (menfess != null) {
        errorsArray.push({ msg: `Menfess sudah ada` });
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
    let triggerWord = req.body.triggerWord

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

        // create new menfess object
        let newMenfess = new models.Menfess({
          menfessName,
          isActive: true,
          triggerWord,
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
};

const createMenfess = (req, res) => {
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
        let consumerKey = sessionData.consumerKey;
        let consumerSecret = sessionData.consumerSecret;

        const filter = { menfessName: sessionData.menfessName };
        const update = {
          accessToken: oauthAccessToken,
          accessSecret: oauthAccessTokenSecret,
          consumerKey,
          consumerSecret,
        };

        let data = models.Menfess.findOneAndUpdate(
          filter,
          update,
          (err, doc) => {
            if (err) {
              console.log(err);
            }
          }
        );

        console.log(`Success add new menfess`);
        sessionData.authenticated = true;
        res.redirect('/home');
      }
    }
  );
};

module.exports = { getRegister, postRegister, createMenfess };
