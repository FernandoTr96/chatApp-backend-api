const {Router} = require('express');
const router = Router();
const chatController = require('../controllers/chatController');
const checkJwt = require('../middlewares/checkJwt');

router.get(
    '/historial/:friendUID/:registers',
    [
        checkJwt
    ],
    chatController.getHistorial
);

module.exports = router;