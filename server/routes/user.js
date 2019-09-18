const userController = require('../controllers/user');

module.exports = app => {
    app.route('/v1/signup/')
        .post(userController.newUser)
    app.route('/v1/signin/')
        .post(userController.signIn)
}