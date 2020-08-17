const { getRegister, postRegister, createMenfess } = require('./register');
const { getLogin, postLogin, getLogout } = require('./login');
const getHome = require('./home');

const registerController = { getRegister, postRegister, createMenfess };
const loginController = { getLogin, postLogin, getLogout };

module.exports = { registerController, loginController, getHome };
