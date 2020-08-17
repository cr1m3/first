const checkSession = (req, res, next) => {
  let sessionData = req.session;
  let menfessName = sessionData.menfessName;

  if (menfessName) {
    next();
  } else {
    console.log('Login first!');
    res.redirect('/login');
  }
};

module.exports = checkSession;
