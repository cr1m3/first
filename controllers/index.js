const { getRegister, postRegister, createMenfess } = require('./register');
const { getLogin, postLogin } = require('./login');

const registerController = { getRegister, postRegister, createMenfess };
const loginController = { getLogin, postLogin };

module.exports = { registerController, loginController };
