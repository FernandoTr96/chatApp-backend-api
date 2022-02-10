const {Router} = require('express');
const router = Router();
const authController = require('../controllers/authController');
const {check} = require('express-validator');
const passwordMatch = require('../middlewares/passwordMatch');
const getErrors = require('../middlewares/getErrors');
const checkJwt = require('../middlewares/checkJwt');

router.post(
    '/',
    [
        check('email','email is required').not().isEmpty(),
        check('password','password is required').not().isEmpty(),
        getErrors
    ],
    authController.loginWithEmailandPassword
);

router.post(
    '/register',
    [
        check('username','username is required').not().isEmpty(),
        check('email','email is required').not().isEmpty(),
        check('password','password is required').not().isEmpty(),
        check('password','the password must have at least 8 and 16 characters, at least one digit, at least one lowercase and at least one uppercase. It may have other symbols.').escape().matches(/^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,16}$/i),
        check('confirmPassword').custom(passwordMatch),
        getErrors
    ],
    authController.registerAccount
);

router.get(
    '/refresh-token',
    [
        checkJwt
    ],
    authController.refreshToken
);

module.exports = router;