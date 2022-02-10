const {Router} = require('express');
const router = Router();
const multer  = require('multer')
const upload = multer();
const userController = require('../controllers/userController');
const checkJwt = require('../middlewares/checkJwt');

router.get(
    '/search',
    [ 
        checkJwt
    ],
    userController.searchUser
);

router.post(
    '/save/profile',
    [ 
        checkJwt
    ],
    userController.saveProfile
);

router.post(
    '/upload/profileImage',
    [ 
        checkJwt,
        upload.single('file')
    ],
    userController.uploadProfileImage
);

module.exports = router;