const express = require('express');

const router = express.Router();

//Connection My Sql
const mysqlConnection = require('../connection/connection-db');

//Authentification
const auth = require('../middlewares/auth');

//Export de fichier
const multer = require('../middlewares/multer-config');

//Controllers
const postsController = require('../controllers/postsController');
const responsesController = require('../controllers/responsesController');

//Posts Routes et Controllers
router.get('/', auth, postsController.getPosts);
router.get('/:id', auth, postsController.getPost);
router.post('/new', auth, postsController.createPost);
router.put('/:id/edit', auth, postsController.modifyPost);
router.delete('/:id', auth, postsController.deletePost);

//Post-response Routes et Controllers
router.post('/:id/new', responsesController.createResponse);

//Likes Dislikes Routes et Controllers
router.post('/:id/like', auth, postsController.like);
router.delete('/:id/like', auth, postsController.unlike);
router.post('/:id/dislike', auth, postsController.dislike);
router.delete('/:id/dislike', auth, postsController.undislike);

router.get('/:id', responsesController.getResponses);

module.exports = router;
 