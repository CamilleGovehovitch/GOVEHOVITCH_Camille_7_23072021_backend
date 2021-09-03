const express = require('express');
const multer = require("../middlewares/multer-config");
const router = express.Router();

//Authentification
const auth = require('../middlewares/auth');

const userControllers = require('../controllers/userController');

router.post('/signup', userControllers.signUp);
router.post('/login', userControllers.login);
router.get('/profile', auth, userControllers.getUserProfile);
router.put('/profile', auth, multer, userControllers.editProfile);
router.delete('/delete', auth, userControllers.deleteUserProfile);

module.exports = router;
