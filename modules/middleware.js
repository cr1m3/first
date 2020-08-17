const menfess = require('../models/menfess');

const isAuthenticated = (req, res, next) => {
  if (req.session.menfessName) {
    next();
  } else {
    console.log('Login first!');
    res.redirect('/login');
  }
};

const redirectHome = (req, res, next) => {
  if (req.session.menfesName) {
    console.log("You're already logged");
    res.redirect('/home');
  } else {
    next();
  }
};

module.exports = { isAuthenticated, redirectHome };
