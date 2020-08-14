const { body } = require('express-validator');

exports.validateRegister = [
  body('menfess_name').notEmpty(),
  body('password', 'Invalid email').notEmpty(),
  body('consumer_key').notEmpty(),
  body('consumer_secret').notEmpty(),
];
