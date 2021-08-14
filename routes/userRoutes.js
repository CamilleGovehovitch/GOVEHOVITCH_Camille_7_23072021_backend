const express = require('express');

const router = express.Router();

//Authentification
const auth = require('../middlewares/auth');

const userControllers = require('../controllers/userController');

router.post('/signup', userControllers.signUp);
router.post('/login', userControllers.login);
router.put('/edit', auth, userControllers.editProfile);

module.exports = router;
