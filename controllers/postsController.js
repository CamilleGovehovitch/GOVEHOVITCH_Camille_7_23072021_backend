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
  console.log("GET POST");
  const postId = req.params.id;

  models.Post.findOne({
    attributes: ["id", "title", "content", "attachement"],
    // order: [sequelize.fn('count', sequelize.col('postId'))],
    include: [
      { model: models.User, as: "user" },
      { model: models.UserLikes, as: "likes" },
      { model: models.UserDislikes, as: "dislikes" },
    ],
    where: { id: postId },
  })
    .then((postFound) => {
      const likes = postFound.likes.length;
      const dislikes = postFound.dislikes.length;
      console.log(likes);
      return res.status(200).json({
        postFound: postFound,
        likes: likes,
        dislikes: dislikes,
      });
    })
    .catch((error) => {
      return res.status(400).json(error);
    });
};

//Create post
exports.createPost = (req, res, next) => {
  console.log("hello post");

  //Body
  const title = req.body.title;
  const content = req.body.content;

  //Const Limit
  const TITLE_LIMIT = 2;
  const CONTENT_LIMIT = 4;

  //Récupération du userId
  const userId = getUserFromToken(req);

  //Test input
  if (title === null || content === null) {
    return res.status(400).json({ error: "missing parameters" });
  }
  if (title.length <= TITLE_LIMIT || content.length <= CONTENT_LIMIT) {
    return res.status(400).json({ error: "missing parameters" });
  }

  models.User.findOne({
    where: { id: userId.user_id },
  })
    .then(function(userFound) {
      if (userFound) {
        models.Post.create({
          title: title,
          content: content,
          userId: userFound.id,
          attachement: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
        })
          .then(function(newPost) {
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
  console.log("MODIFY POST");

  const postId = req.params.id;
  const title = req.body.title;
  const content = req.body.content;

  const attachement = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;

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
          .catch((error) => {
            console.log(error);
            return res.status(400).json({ error: "error" });
          });
      } else {
        return res.status(400).json(generateErrorMessage("Post non trouvé"));
      }
    })
    .catch(function(err) {
      console.log(err);
      return res.status(400).json(generateErrorMessage(USER_NOT_FOUND));
    });
};

//Delete post
exports.deletePost = (req, res, next) => {
  const postId = req.params.id;
  const user = getUserFromToken(req);
  models.User.findOne({
    attibutes: ["id", "is_admin"],
    where: { id: user.user_id },
  })
    .then((adminFound) => {
      console.log(adminFound);
      if (adminFound.is_admin === true) {
        models.UserLikes.findOne({
          attributes: ["id"],
          where: { postId: postId },
        })
          .then((userLikeFound) => {
            console.log(userLikeFound);
            userLikeFound
              .destroy({
                where: { id: userLikeFound.id },
              })
              .then(() => {
                models.UserDislikes.findOne({
                  attributes: ["id"],
                  where: { postId: postId },
                })
                  .then((userDislikFound) => {
                    console.log(userDislikFound);
                    userDislikFound
                      .destroy({
                        where: { id: userDislikFound.id },
                      })
                      .then(() => {
                        models.Post.findOne({
                          attributes: ["id"],
                          where: { id: postId },
                        })
                          .then((postFound) => {
                            postFound
                              .destroy({
                                where: { id: postId },
                              })
                              .then(() => {
                                return res.status(200).json({ message: "succefully deleted" });
                              })
                              .catch((error) => {
                                console.log(error);
                                return res.status(400).json(generateErrorMessage("Une erreur est survenue lors de la suppréssion"));

                              });
                          })
                          .catch((error) => {
                            console.log(error);
                            return res.status(404).json(generateErrorMessage("Post non trouvé"));

                          });
                      })
                      .catch((error) => {
                        console.log(error);
                        return res.status(400).json(generateErrorMessage("Une erreur est survenue lors de la suppréssion"));
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                    return res.status(404).json(generateErrorMessage("Disike non trouvé"));
                  });
              })
              .catch((error) => {
                console.log(error);
                return res.status(404).json(generateErrorMessage("Une erreur est survenue lors de la suppréssion"));
              });
          })
          .catch((error) => {
            console.log(error);
            return res.status(404).json(generateErrorMessage("Like non trouvé"));
          });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(404).json(generateErrorMessage("Admin non trouvé"));
    });

  // models.Post.findOne({
  //   attributes: ["id", "attachement"],
  //   where: { id: postId },
  // })
  //   .then((postFound) => {
  //     const filename = postFound.attachement.split("/images/")[1];

  //     fs.unlink(`images/${filename}`, () => {
  //       postFound
  //         .destroy({
  //           where: { id: postFound.id },
  //         })
  //         .then(() => {
  //           console.log("POST DELETED");
  //           return res.status(200).json({ message: "Le Post à été supprimé avec succès" });
  //         })
  //         .catch((error) => {
  //           console.log(error);
  //           return res.status(500).json({ error: "Le post n'a pu être supprimé" });
  //         });
  //     });
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     return res.status(400).json({ error: "Le post n'a pas été trouvé" });
  //   });
};

//Get all posts
exports.getPosts = (req, res, next) => {
  console.log("GET TOPICS");
  //lister les posts, systeme de pagination
  // let fields = req.query.fields;
  let limit = parseInt(req.query.limit);
  let offset = parseInt(req.query.offset);
  // count [nombre de post total accessible] / [limite] = nombre de page dispo.
  // feature pour bien pagine le front (optionel)
  // Trouver les trois page disponible avant la page courante (offset) afficher ces 7 pages

  models.Post.findAll({
    subQuery: false,
    order: [["createdAt", "DESC"]],
    attributes: ["id", "userId", "title", "content", "attachement", "createdAt"],
    limit: limit,
    offset: limit * (offset - 1),
    include: [
      { model: models.User, as: "user" },
      { model: models.UserLikes, as: "likes" },
      { model: models.UserDislikes, as: "dislikes" },
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
  console.log("LIKE POST!!!!!!!!!!!!!!!!");
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
  console.log("UNLIKE POST");
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
            .then(() => {
              return res.status(201).json({ message: "post succefully disliked" });
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
  console.log("UNDSILIKE POST");

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

//Count Likes
exports.countLikes = (req, res, next) => {
  console.log("hello count");
  //User id
  const user = getUserFromToken(req);
  //Post id
  const postId = req.params.id;

  models.User.findOne({
    attributes: ["id"],
    where: { id: user.user_id },
  })
    .then((userFound) => {
      // TODO: Tu devrais pourvoir faire un FindOne de ton post, et ensuite faire post.userLikes.length ou .count par exemple
      // Et du coup au lieu d'avoir cette route que te devrais appeler pour chaque route, renvois ce chiffre drectement avec le post
      // Dans la routes Get post
      models.UserLikes.count({
        where: { postId: postId },
      })
        .then((likeCount) => {
          console.log(likeCount);
          return res.status(200).json(likeCount);
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json(generateErrorMessage("Une erreur est survenue"));
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(404).json(generateErrorMessage("L'utilisateur n'a pas été trouvé"));
    });
};

//Count Likes
exports.countDislikes = (req, res, next) => {
  console.log("hello count dislikes");
  //User id
  const user = getUserFromToken(req);
  //Post id
  const postId = req.params.id;

  models.User.findOne({
    attributes: ["id"],
    where: { id: user.user_id },
  })
    .then((userFound) => {
      // TODO, comme pour like
      models.UserDislikes.count({
        where: { postId: postId },
      })
        .then((dislikeCount) => {
          console.log(dislikeCount);
          return res.status(200).json(dislikeCount);
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json(generateErrorMessage("Il n'y a aucun dislikes sur ce post"));
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(404).json(generateErrorMessage("L'utilisateur n'a pas été trouvé"));
    });
};

// function likeCallback(err, data) {
//   if (!err) {
//     res.status(201).json({ message: "succefully liked" });
//   } else {
//     console.log(err);
//   }
// }

// function dislikeCallback(err, data) {
//   if (!err) {
//     res.status(201).json({ message: "succefully disliked" });
//   } else {
//     console.log(err);
//   }
// }

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
