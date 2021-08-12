const express = require('express');

const router = express.Router();

//Connestion My Sql
const mysqlConnection = require('../connection/connection-db');

//Authentification
const auth = require('../middlewares/auth');

const userControllers = require('../controllers/userController');

router.post('/signup', userControllers.signUp);
router.post('/login', userControllers.login);
router.put('/edit', auth, userControllers.editProfile);

module.exports = router;
