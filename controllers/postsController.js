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
  console.log("route one topic");
  const postId = req.params.id;

  models.Post.findOne({
    attributes: ["title", "content", "attachement"],
    where: { id: postId },
  })
    .then(function(postFound) {
      return res.status(200).json({ postFound });
    })
    .catch(function(err) {
      return res.status(400).json(err);
    });
};

//Create post
exports.createPost = (req, res, next) => {
  console.log("hello post");
  console.log(req.body, "BODY");
  //Body
  const title = req.body.title;
  const content = req.body.content;

  //Const Limit
  const TITLE_LIMIT = 2;
  const CONTENT_LIMIT = 4;

  //Récupération du userId
  const auth = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(auth, process.env.DB_SECRET);
  const userId = decodedToken.user_id;
  console.log(userId);

  //Test input
  if (title === null || content === null) {
    return res.status(400).json({ error: "missing parameters" });
  }
  if (title.length <= TITLE_LIMIT || content.length <= CONTENT_LIMIT) {
    return res.status(400).json({ error: "missing parameters" });
  }

  models.User.findOne({
    where: { id: userId },
  })
    .then(function(userFound) {
      if (userFound) {
        models.Post.create({
          title: title,
          content: content,
          UserId: userFound.id,
          attachement: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`,
        })
          .then(function(newPost) {
            console.log(newPost);
            return res.status(200).json({ newPost });
          })
          .catch(function(err) {
            console.log(err);
          });
      }
    })
    .catch(function(err) {
      return res.status(400).json({ error: USER_NOT_FOUND });
    });
};

//Modify topic
exports.modifyPost = (req, res, next) => {
  console.log("MODIFY Topic");

  const postId = req.params.id;
  const title = req.body.title;
  const content = req.body.content;

  const attachement = `${req.protocol}://${req.get("host")}/images/${
    req.file.filename
  }`;

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
            attachement: req.file ? attachement : postFound.attachement,
          })
          .then((postUpdated) => {
            return res.status(201).json(postUpdated);
          })
          .catch(function(err) {
            return res.status(400).json({ error: "error" });
          });
      } else {
        console.log(req.body);
        return res.status(400).json(generateErrorMessage("Post non trouvé"));
      }
    })
    .catch(function(err) {
      console.log("err");
      console.log(err);
      return res.status(400).json(generateErrorMessage(USER_NOT_FOUND));
    });
};

//Delete post
exports.deletePost = (req, res, next) => {
  const postId = req.params.id;

  models.Post.findOne({
    attributes: ["id", "attachement"],
    where: { id: postId },
  })
    .then((postFound) => {
      console.log(postFound);
      const filename = postFound.attachement.split("/images/")[1];

      fs.unlink(`images/${filename}`, () => {
        postFound
          .destroy({
            where: { id: postFound.id },
          })
          .then(() => {
            console.log("POST DELETED");
            return res
              .status(200)
              .json({ message: "Le Post à été supprimé avec succès" });
          })
          .catch((error) => {
            console.log(error);
            return res
              .status(500)
              .json({ error: "Le post n'a pu être supprimé" });
          });
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json({ error: "Le post n'a pas été trouvé" });
    });
};

//Get all posts
exports.getPosts = (req, res, next) => {
  console.log("GET TOPICS");
  //lister les posts, systeme de pagination
  let fields = req.query.fields;
  let limit = parseInt(req.query.limit);
  let offset = parseInt(req.query.offset);
  let order = req.query.order;

  console.log(limit, offset, order);
  models.Post.findAll({
    order: [order != null ? order.split(":") : ["title", "ASC"]],
    attributes: ["id", "userId", "title", "content", "attachement"],
    limit: 5,
    offset: 1,
    include: [
      {
        model: models.User,
        attributes: ["id"],
      },
    ],
  })
    .then(function(posts) {
      return res.status(200).json(posts);
    })
    .catch(function(err) {
      console.log(err);
      return res.status(500).json({ error: "Invalid fields" });
    });
};

//Like post
exports.like = (req, res, next) => {
  console.log("hello like ROUTES");
  //User id
  const user = getUserFromToken(req);
  //Post id
  const postId = req.params.id;

  //Check si l'utilisateur n'a pas préalablement disliké le post
  models.UserDislikes.findOne({
    attributes: ["id", "userId", "postId"],
    where: {
      userId: user.user_id,
      postId: postId,
    },
  })
    .then((dislike) => {
      if (dislike) {
        return res
          .status(409)
          .json(
            generateErrorMessage(
              "Vous ne pouvez liké ce post, vous l'avez déjà disliké"
            )
          );
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
            return res
              .status(409)
              .json(generateErrorMessage("Vous avez déjà liké ce post"));
          } else {
            models.UserLikes.create({
              userId: user.user_id,
              postId: postId,
            })
              .then(() => {
                return res
                  .status(201)
                  .json({ message: "Post succefully Liked" });
              })
              .catch((err) => {
                console.log(err);
                return res
                  .status(400)
                  .json(generateErrorMessage("Une erreur est survenue"));
              });
          }
          console.log(like, "LIKE");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((error) => {
      console.log(error);
      return res
        .status(500)
        .json(generateErrorMessage("Une erreur est survenue"));
    });
};

//Unlike posts
exports.unlike = (req, res, next) => {
  console.log("hello unlike ROUTES");
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
      console.log(like, "Like");
      if (!like) {
        return res
          .status(409)
          .json({ message: "vous avez déjà unlike ce post" });
      }
      models.UserLikes.destroy({
        where: {
          id: like.id,
          userId: like.userId,
          postId: like.postId,
        },
      })
        .then(() => {
          console.log("post fully unliked");
          return res.status(200).json({ message: "Post unliké" });
        })
        .catch((error) => {
          console.log(error);
          return res
            .status(500)
            .json(generateErrorMessage("Une erreur est survenue"));
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(404).json(generateErrorMessage(USER_NOT_FOUND));
    });
};

//Dislike post
exports.dislike = (req, res, next) => {
  console.log("hello dislike ROUTES");
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
      console.log(like);
      if (like) {
        return res
          .status(409)
          .json(
            generateErrorMessage(
              "Vous ne pouvez dislike ce post car vous l'avez préalablement liké"
            )
          );
      }
      models.UserDislikes.findOne({
        attributes: ["id", "userId", "postId"],
        where: {
          userId: user.user_id,
          postId: postId,
        },
      })
        .then((dislike) => {
          console.log(dislike);
          if (dislike) {
            return res
              .status(409)
              .json(generateErrorMessage("vous avez déjà disliké ce post"));
          }
          models.UserDislikes.create({
            userId: user.user_id,
            postId: postId,
          })
            .then(() => {
              return res
                .status(201)
                .json({ message: "post succefully disliked" });
            })
            .catch((error) => {
              console.log(error);
              return res
                .status(500)
                .json(generateErrorMessage("Le post n'éxiste pas"));
            });
        })
        .catch((error) => {
          console.log(error);
          return res
            .status(404)
            .json(generateErrorMessage("une erreur est survenue"));
        });
    })
    .catch((error) => {
      console.log(error);
      return res
        .status(500)
        .json(generateErrorMessage("Une erreur est survenue"));
    });
};
//Undislike posts
exports.undislike = (req, res, next) => {
  console.log("hello undislike ROUTES");

  //User id
  const user = getUserFromToken(req);
  //Post id
  const postId = req.params.id;
  console.log(postId, user.user_id);

  models.UserDislikes.findOne({
    attributes: ["id", "userId", "postId"],
    where: {
      userId: user.user_id,
      postId: postId,
    },
  })
    .then((dislike) => {
      console.log(dislike, "DISLIKE");
      if (!dislike) {
        return res
          .status(409)
          .json(generateErrorMessage("vous avez déjà undisliké ce post"));
      }
      models.UserDislikes.destroy({
        where: {
          userId: user.user_id,
          postId: postId,
        },
      })
        .then(() => {
          return res
            .status(200)
            .json({ message: "post succefully undisliked" });
        })
        .catch((error) => {
          console.log(error);
          return res
            .status(500)
            .json(generateErrorMessage("Vous avez déjà undisliké ce post"));
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(404).json(generateErrorMessage("dislike non trouvé"));
    });
};

function likeCallback(err, data) {
  if (!err) {
    res.status(201).json({ message: "succefully liked" });
  } else {
    console.log(err);
  }
}

function dislikeCallback(err, data) {
  if (!err) {
    res.status(201).json({ message: "succefully disliked" });
  } else {
    console.log(err);
  }
}

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
