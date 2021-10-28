const mysql = require("mysql2");

//Token
const jwt = require("jsonwebtoken");

//Models
const models = require("../models");
const { post } = require("../routes/postsRoutes");

//Fs
const fs = require("fs");

//Constantes
const USER_NOT_FOUND = "Utilisateur non trouvé";

//Get post
exports.getPost = (req, res, next) => {
  console.log("GET ONE POST");
  const postId = req.params.id;

  models.Post.findOne({
    attributes: ["id", "title", "content", "attachement"],
    order: [[{ model: models.Comment, as: "comment" }, "createdAt", "DESC"]],
    include: [
      { model: models.User, as: "user" },
      { model: models.UserLikes, as: "likes" },
      { model: models.UserDislikes, as: "dislikes" },
      { model: models.Comment, as: "comment" },
    ],
    where: { id: postId },
  })
    .then((postFound) => {
      return res.status(200).json(postFound);
    })
    .catch((error) => {
      return res.status(400).json(error);
    });
};

//Create post
exports.createPost = (req, res, next) => {
  //Body
  const title = req.body.title;
  const content = req.body.content;

  //Const Limit
  const TITLE_LIMIT = 2;
  const CONTENT_LIMIT = 4;

  //Récupération du userId
  const userId = getUserFromToken(req);

  //Test input
  if (title === null) {
    return res.status(400).json(generateErrorMessage("Le titre ne peut être vide"));
  }
  if (title.length <= TITLE_LIMIT) {
    return res.status(400).json(generateErrorMessage("Le titre ne peut être inférieur à 2 charactères"));
  }
  if (content === null) {
    return res.status(400).json(generateErrorMessage("Le content ne peut être vide"));
  }
  if (content.length <= CONTENT_LIMIT) {
    return res.status(400).json(generateErrorMessage("Le contenu ne peut être inférieur à 4 charactères"));
  }

  models.User.findOne({
    where: { id: userId.user_id },
  })
    .then((userFound) => {
      if (userFound) {
        models.Post.create({
          title: title,
          content: content ? content : null,
          userId: userFound.id,
          attachement: req.file ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}` : null,
        })
          .then((newPost) => {
            return res.status(200).json(newPost);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json({ error: USER_NOT_FOUND });
    });
};

//Modify topic
exports.modifyPost = (req, res, next) => {
  const postId = req.params.id;
  const title = req.body.title;
  const content = req.body.content;

  models.Post.findOne({
    attributes: ["id", "title", "content", "attachement"],
    where: { id: postId },
  })
    .then(function(postFound) {
      if (postFound) {
        postFound
          .update({
            title: title ? title : postFound.title,
            content: content ? content : postFound.content,
            attachement: req.file ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}` : postFound.attachement,
          })
          .then((postUpdated) => {
            return res.status(201).json(postUpdated);
          })
          .catch((error) => {
            console.log(error);
            return res.status(400).json({ error: "error" });
          });
      } else {
        return res.status(400).json(generateErrorMessage("Post non trouvé"));
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json(generateErrorMessage(USER_NOT_FOUND));
    });
};

//Delete post
exports.deletePost = async (req, res, next) => {
  const user = getUserFromToken(req);
  const userFounded = await findUser();
  const likesFounded = await findUserLike();
  const dislikesFounded = await findUserDislike();
  const postFounded = await findPost();
  const commentFounded = await findComments();

  if (!userFounded.is_admin) {
    return res.status(401).json(generateErrorMessage("Vous n'êtes pas autorisé à supprimer ce post"));
  }
  try {
    // if (likesFounded) {
    //   const likesMaped = likesFounded.map((like) => {
    //     like.destroy();
    //   });
    // }
    // if (dislikesFounded) {
    //   const dislikesMaped = dislikesFounded.map((dislike) => {
    //     dislike.destroy();
    //   });
    // }
    // if (commentFounded) {
    //   const commentMapped = commentFounded.map((comment) => {
    //     console.log(comment);
    //     comment.destroy();
    //   });
    // }
    if (postFounded) {
      // const postMaped = postFounded.map((post) => {
      //   post.destroy();
      // });
      postFounded.destroy();
    }
    return res.status(200).json({ message: "Suppression du post réussie" });
  } catch (error) {
    return res.status(400).json(generateErrorMessage("Une erreur est survenue"));
  }
  async function findUser() {
    return models.User.findOne({
      attributes: ["id", "is_admin"],
      where: { id: user.user_id },
    });
  }
  async function findPost() {
    const postId = req.params.id;
    return models.Post.findOne({
      attributes: ["id", "userId"],
      where: { id: postId },
    });
  }
  async function findUserLike() {
    const postId = req.params.id;
    return models.UserLikes.findAll({
      attributes: ["id", "postId", "userId"],
      where: { postId: postId },
    });
  }
  async function findUserDislike() {
    const postId = req.params.id;
    return models.UserDislikes.findAll({
      attributes: ["id", "postId", "userId"],
      where: { postId: postId },
    });
  }
  async function findComments() {
    const postId = req.params.id;
    console.log(postId);
    return models.Comment.findAll({
      attributes: ["id", "postId"],
      where: { postId: postId },
    });
  }
};
//Get all posts
exports.getPosts = (req, res, next) => {
  let limit = parseInt(req.query.limit);
  let offset = parseInt(req.query.offset);

  // count [nombre de post total accessible] / [limite] = nombre de page dispo.
  // feature pour bien pagine le front (optionel)
  // Trouver les trois page disponible avant la page courante (offset) afficher ces 7 pages

  models.Post.findAndCountAll({
    subQuery: false,
    order: [["createdAt", "DESC"]],
    attributes: ["id", "userId", "title", "content", "attachement", "createdAt"],
    limit: limit,
    offset: limit * (offset - 1),
    include: [
      { model: models.User, as: "user" },
      { model: models.UserLikes, as: "likes" },
      { model: models.UserDislikes, as: "dislikes" },
      { model: models.Comment, as: "comment" },
    ],
  })
    .then((posts) => {
      return res.status(200).json(posts);
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: "Invalid fields" });
    });
};

//Like post
exports.like = (req, res, next) => {
  //User id
  const user = getUserFromToken(req);
  //Post id
  const postId = req.params.id;

  models.UserDislikes.findOne({
    attributes: ["id", "userId", "postId"],
    where: {
      userId: user.user_id,
      postId: postId,
    },
  })
    .then((dislike) => {
      if (dislike) {
        return res.status(409).json(generateErrorMessage("Vous ne pouvez liké ce post, vous l'avez déjà disliké"));
      }
      models.UserLikes.findOne({
        attributes: ["id", "userId", "postId"],
        where: {
          userId: user.user_id,
          postId: postId,
        },
      })
        .then((like) => {
          if (like) {
            return res.status(409).json(generateErrorMessage("Vous avez déjà liké ce post"));
          } else {
            models.UserLikes.create({
              userId: user.user_id,
              postId: postId,
            })
              .then((userLike) => {
                return res.status(201).json(userLike);
              })
              .catch((error) => {
                console.log(error);
                return res.status(400).json(generateErrorMessage("Une erreur est survenue"));
              });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json(generateErrorMessage("Une erreur est survenue"));
    });
};

//Unlike posts
exports.unlike = (req, res, next) => {
  //User id
  const user = getUserFromToken(req);
  //Post id
  const postId = req.params.id;

  models.UserLikes.findOne({
    attributes: ["id", "userId", "postId"],
    where: {
      userId: user.user_id,
      postId: postId,
    },
  })
    .then((like) => {
      if (!like) {
        return res.status(409).json({ message: "vous avez déjà unlike ce post" });
      }
      models.UserLikes.destroy({
        where: {
          id: like.id,
          userId: like.userId,
          postId: like.postId,
        },
      })
        .then(() => {
          return res.status(200).json({ message: "Post unliké" });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json(generateErrorMessage("Une erreur est survenue"));
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(404).json(generateErrorMessage(USER_NOT_FOUND));
    });
};

//Dislike post
exports.dislike = (req, res, next) => {
  //User id
  const user = getUserFromToken(req);
  //Post id
  const postId = req.params.id;

  models.UserLikes.findOne({
    attributes: ["id", "userId", "postId"],
    where: {
      userId: user.user_id,
      postId: postId,
    },
  })
    .then((like) => {
      if (like) {
        return res.status(409).json(generateErrorMessage("Vous ne pouvez dislike ce post car vous l'avez préalablement liké"));
      }
      models.UserDislikes.findOne({
        attributes: ["id", "userId", "postId"],
        where: {
          userId: user.user_id,
          postId: postId,
        },
      })
        .then((dislike) => {
          if (dislike) {
            return res.status(409).json(generateErrorMessage("vous avez déjà disliké ce post"));
          }
          models.UserDislikes.create({
            userId: user.user_id,
            postId: postId,
          })
            .then((userDislike) => {
              return res.status(201).json(userDislike);
            })
            .catch((error) => {
              console.log(error);
              return res.status(500).json(generateErrorMessage("Le post n'éxiste pas"));
            });
        })
        .catch((error) => {
          console.log(error);
          return res.status(404).json(generateErrorMessage("une erreur est survenue"));
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json(generateErrorMessage("Une erreur est survenue"));
    });
};

//Undislike posts
exports.undislike = (req, res, next) => {
  //User id
  const user = getUserFromToken(req);
  //Post id
  const postId = req.params.id;

  models.UserDislikes.findOne({
    attributes: ["id", "userId", "postId"],
    where: {
      userId: user.user_id,
      postId: postId,
    },
  })
    .then((dislike) => {
      if (!dislike) {
        return res.status(409).json(generateErrorMessage("vous avez déjà undisliké ce post"));
      }
      models.UserDislikes.destroy({
        where: {
          userId: user.user_id,
          postId: postId,
        },
      })
        .then(() => {
          return res.status(200).json({ message: "post succefully undisliked" });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json(generateErrorMessage("Vous avez déjà undisliké ce post"));
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(404).json(generateErrorMessage("dislike non trouvé"));
    });
};

function generateErrorMessage(message) {
  return {
    error: message,
  };
}

function getUserFromToken(req) {
  //Récupération du userId
  const auth = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(auth, process.env.DB_SECRET);
  return decodedToken;
}
