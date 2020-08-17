const { models, getOAuthMenfess } = require('../models');
const { validationResult } = require('express-validator');

const getLogin = (req, res) => {
  res.render('login');
};

const postLogin = (req, res) => {
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
            sessionData.menfessName = menfess.menfessName;
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
};

const getLogout = (req, res) => {
  req.session.destroy(err => {
    console.log('Logout Success');
    res.redirect('/');
  });
};

module.exports = { getLogin, postLogin, getLogout };
