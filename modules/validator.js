const { body } = require('express-validator');

const register = [
  body('menfessName', 'Menfess tidak boleh kosong').notEmpty(),
  body('triggerWord', 'Trigger word tidak boleh kosong').notEmpty(),
  body('password', 'Password tidak boleh kosong').notEmpty(),
  body('consumerKey', 'Consumer key tidak boleh kosong').notEmpty(),
  body('consumerSecret', 'Consumer key tidak boleh kosong').notEmpty(),
];

const login = [
  body('menfessName', 'Menfess tidak boleh kosong').notEmpty(),
  body('password', 'Password tidak boleh kosong').notEmpty(),
];

const formValidate = {
  register,
  login,
};

module.exports = { formValidate };
