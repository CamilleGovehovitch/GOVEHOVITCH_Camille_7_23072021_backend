const mysql = require("mysql2");

//Token
const jwt = require("jsonwebtoken");

//Models
const models = require("../models");

//Create comment
exports.createComment = (req, res, next) => {
  console.log('hey je suis là');
  //Body
  const content = req.body.content;

  //Const Limit
  const CONTENT_LIMIT = 4;

  const user = getUserFromToken(req);
  console.log(user, 'USER in TOKEN');

  const postId = req.params.id;

  //Test input
  if (content && content.length <= CONTENT_LIMIT) {
    return res.status(401).json({ error: "Le champs ne peut être vide ou inférieur à 4 caractères" });
  }
  models.User.findOne({
    attributes: ["id", "username"],
    where: {id: user.user_id}
  })
    .then((userFounded) => {

      models.Comment.create({
        content: content,
        userId: user.user_id,
        postId: postId,
        username: userFounded.username ? userFounded.username : 'User ID: ' + userFounded.id,
      })
        .then((newComment) => {
          console.log(newComment);
          res.status(200).json(newComment);
        })
        .catch((error) => {
          console.log(error);
          res.status(400).json(generateErrorMessage("Une erreur à la création du commentaire est survenue"));
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(404).json(generateErrorMessage("Le post commenté n'existe pas"));
    });
};

//Delete comment
exports.deleteComment = async (req, res, next) => {
  console.log("hello delete comment");
  const user = getUserFromToken(req);
  const postId = req.params.postId;
  const commentId = req.params.id;
  console.log(req.params);

  const userFounded = await findUser(req);
  const postFounded = await findPost(req);

  if (!userFounded.is_admin) {
    return res.status(401).json(generateErrorMessage("Vous n'êtes pas autorisé à supprimer ce commentaire"));
  }
  try {
    if (postFounded) {
      models.Comment.findOne({
        attributes: ["id"],
        where: { id: commentId },
      })
        .then((comment) => {
          comment.destroy();
          return res.status(200).json({ message: "Commentaire supprimé avec succes" });
        })
        .catch((error) => {
          console.log(error);
          return res.status(404).json(generateErrorMessage("Le commentaire n'existe pas"));
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(generateErrorMessage("Une erreur est survenue"));
  }
};

function getUserFromToken(req) {
  //Récupération du userId
  const auth = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(auth, process.env.DB_SECRET);
  return decodedToken;
}

function generateErrorMessage(message) {
  return {
    error: message,
  };
}

async function findUser(req) {
  const user = getUserFromToken(req);

  return models.User.findOne({
    attributes: ["id", "is_admin"],
    where: { id: user.user_id },
  });
}
async function findPost(req) {
  const postId = req.params.postId;
  return models.Post.findOne({
    attributes: ["id", "userId"],
    where: { id: postId },
    include: [{ model: models.Comment, as: "comment" }],
  });
}
async function getComment(req) {
  const postId = req.params.id;
  return models.Comment.findAll({
    attributes: ["id", "userId", "postId"],
    where: { id: postId },
    include: [{ model: models.Comment, as: "comment" }],
  });
}
