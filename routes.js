const routes = require('express').Router();
const { formValidate } = require('./modules/validator');
const {
  registerController,
  loginController,
  getHome,
} = require('./controllers/index');
const { isAuthenticated, redirectHome } = require('./modules/middleware');

routes.get('/', (req, res) => {
  res.render('index');
});

routes.get('/login', redirectHome, loginController.getLogin);

routes.post('/login', formValidate.login, loginController.postLogin);

routes.get('/register', redirectHome, registerController.getRegister);

routes.post(
  '/register',
  formValidate.register,
  registerController.postRegister
);

routes.get('/sessions/callback', registerController.createMenfess);

routes.get('/home', isAuthenticated, getHome);

routes.get('/logout', loginController.getLogout);

module.exports = routes;
