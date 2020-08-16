const { body } = require('express-validator');

const register = [
  body('menfessName', "Menfess name can't be empty").notEmpty(),
  body('password', "Password can't be empty").notEmpty(),
  body('consumerKey', "Consumer key can't be empty").notEmpty(),
  body('consumerSecret', "Consumer key can't be empty").notEmpty(),
];

const login = [
  body('menfessName', "Menfess name can't be empty").notEmpty(),
  body('password', "Password can't be empty").notEmpty(),
];

const formValidate = {
  register,
  login,
};

module.exports = { formValidate };
