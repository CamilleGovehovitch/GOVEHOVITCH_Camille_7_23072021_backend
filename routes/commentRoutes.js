const express = require("express");

const router = express.Router();

//Authentification
const auth = require("../middlewares/auth");

//Controllers
const commentController = require("../controllers/commentController");

//Comments Routes et Controllers
router.post("/:id/new", auth, commentController.createComment);
router.delete("/:postId/delete/:id", commentController.deleteComment);
module.exports = router;
