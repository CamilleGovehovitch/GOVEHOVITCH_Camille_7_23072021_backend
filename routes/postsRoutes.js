const express = require("express");

const router = express.Router();

//Authentification
const auth = require("../middlewares/auth");

//Export de fichier
const multer = require("../middlewares/multer-config");

//Controllers
const postsController = require("../controllers/postsController");
const commentController = require("../controllers/commentController");

//Posts Routes et Controllers
router.get("/", auth, postsController.getPosts);
router.get("/:id", auth, postsController.getPost);
router.post("/new", auth, multer, postsController.createPost);
router.put("/:id/edit", auth, multer, postsController.modifyPost);
router.delete("/:id", auth, postsController.deletePost);

//Likes Dislikes Routes et Controllers
router.post("/:id/like", auth, postsController.like);
router.delete("/:id/like", auth, postsController.unlike);
router.post("/:id/dislike", auth, postsController.dislike);
router.delete("/:id/dislike", auth, postsController.undislike);

//Comments Routes et Controllers
// router.post("/:id/comment/new", auth, commentController.createComment);
// router.delete("/:postId/comment/:id", commentController.deleteComment);

module.exports = router;
