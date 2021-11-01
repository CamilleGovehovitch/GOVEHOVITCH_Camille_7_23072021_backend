const mysql = require("mysql2");

//Models
const models = require("../models");

//Fs
const fs = require("fs");

//Sécurité
const bcrypt = require("bcrypt");
const Maskdata = require("maskdata");
const jwt = require("jsonwebtoken");

//Check password strength
const { passwordStrength } = require("check-password-strength");
//Custom options password strengh
const customOptions = [
  {
    id: 0,
    value: "trop faible",
    minDiversity: 0,
    minLength: 0,
  },
  {
    id: 1,
    value: "faible",
    minDiversity: 2,
    minLength: 6,
  },
  {
    id: 2,
    value: "moyen",
    minDiversity: 4,
    minLength: 8,
  },
  {
    id: 3,
    value: "fort",
    minDiversity: 4,
    minLength: 10,
  },
];

//Mask Options
const emailMask2Options = {
  maskWith: "*",
  unmaskedStartCharactersBeforeAt: 10,
  unmaskedEndCharactersAfterAt: 5,
  maskAtTheRate: false,
};

//Regex
const emailRegex = new RegExp("^[a-zA-Z-0-9._-]+@[a-z0-9._-]{2,}.[a-z]{2,4}$");

//Signup
exports.signUp = (req, res, next) => {
  //Params
  const email = req.body.email;
  const password = req.body.password;
  const bio = req.body.bio;
  // const username = req.body.username;
  // const defaultProfilePicture = "/images/balancoire.png1630014597273.png";

  //Masked params
  const emailMasked = Maskdata.maskEmail2(req.body.email, emailMask2Options);
  const passwordStrengthTested = passwordStrength(req.body.password, customOptions).value;

  if (email === null || password === null) {
    return res.status(400).json({ error: "Missing Parameters" });
  }
  if (!email.match(emailRegex)) {
    return res.status(400).json({ error: "Votre email n'a pas la forme requise" });
  }
  if (passwordStrengthTested !== "fort") {
    return res.status(422).json({
      error:
        "Votre password doit contenir une majuscule un caractère spéciale, un chiffre et au minimum 10 caractères car votre passord est " +
        passwordStrengthTested,
    });
  }

  models.User.findOne({
    attributes: ["email"],
    where: { email: email },
  })
    .then(function(userFound) {
      if (!userFound) {
        bcrypt.hash(password, 10, (err, bcryptedPassword) => {
          let newUser = models.User.create({
            email: emailMasked,
            password: bcryptedPassword,
            bio: bio,
            // attachement: defaultProfilePicture,
            is_admin: 0,
          })
            .then(function(newUser) {
              return res.status(201).json({
                userId: newUser.id,
              });
            })
            .catch(function(err) {
              console.log(err);
              res.status(400).json({ error: "L'utilisateur existe déjà" });
            });
        });
      } else {
        return res.status(409).json({ error: "L'utilisateu existe déjà" });
      }
    })
    .catch(function(err) {
      console.log(err);
      return res.status(500).json({ error: "L'utilisateur est introuvable" });
    });
};

//Login
exports.login = (req, res, next) => {
  const userEmailMasked = Maskdata.maskEmail2(req.body.email, emailMask2Options);

  let email = req.body.email;
  let password = req.body.password;

  if (email == "" || password == "") {
    return res.status(400).json({ error: "Les champs email et password doivent être remplis" });
  }
  //Récupération du user en comparant l'email de la requete à l'email en bdd
  models.User.findOne({
    where: { email: userEmailMasked },
  })
    .then(function(userFound) {
      if (userFound) {
        //Bycrypt compare le password de la requete à celui sâlé en bdd avec la même clé
        bcrypt.compare(password, userFound.password, (err, resBcrypt) => {
          if (resBcrypt) {
            return res.status(200).json({
              userId: userFound.id,
              is_admin: userFound.is_admin,
              username: userFound.username,
              token: jwt.sign({ user_id: userFound.id }, process.env.DB_SECRET, { expiresIn: "24h" }, { is_admin: userFound.is_admin }),
            });
          } else {
            return res.status(404).json({ error: "Mot de passe incorrect" });
          }
        });
      } else {
        return res.status(404).json({ error: "Email incorrect" });
      }
    })
    .catch(function(err) {
      console.log(err);
      return res.status(500).json({ error: "unable to verify" });
    });
};

//Edit user
exports.editProfile = (req, res, next) => {
  console.log("hello EDIT");
  // Params
  const body = req.body;
  const username = req.body.username;
  const bio = req.body.bio;
  delete body.email;
  delete body.password;
  delete body.id;
  delete body.createdAt;
  delete body.updatedAt;

  //Récupération du userId
  const user = getUserFromToken(req);

  models.User.findOne({
    attributes: ["id", "email", "bio", "attachement", "is_admin"],
    where: { id: user.user_id },
  })
    .then((userFound) => {
      userFound
        .update({
          username: username ? username : userFound.username,
          bio: bio ? bio : userFound.bio,
          attachement: req.file ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}` : userFound.attachement,
        })
        .then(() => {
          return res.status(201).json(userFound);
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({ error: "L'utilisateur n'a pu être mis à jour" });
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(404).json({ error: "User not found" });
    });
};

//Delete user
exports.deleteUserProfile = async (req, res, next) => {

  //Récupération du userId
  const user = getUserFromToken(req);
  const postId = req.params.id;
  console.log(postId, "POST ID");
  //get user
  async function getUserFromApi() {
    return models.User.findOne({
      where: { id: user.user_id },
    });
  }
  //get User Posts
  async function getUserPostsFromApi() {
    return models.Post.findAll({
      where: { userId: user.user_id },
    });
  }
  //get Likes from Post
  async function getLikesFromPost() {
    return models.UserLikes.findAll({
      where: { userId: user.user_id },
    });
  }
  //get Dislikes from Post
  async function gettDislikesFromPost() {
    return models.UserDislikes.findAll({
      where: { userId: user.user_id },
    });
  }
  const userFounded = await getUserFromApi();
  const userPostsFounded = await getUserPostsFromApi();
  const likes = await getLikesFromPost();
  const dislikes = await gettDislikesFromPost();

  if (userFounded) {
    try {
      const likeMaped = likes.map((like) => like.destroy());
      const dislikeMaped = dislikes.map((dislike) => dislike.destroy());
      const postMaped = userPostsFounded.map((post) => post.destroy());

      userFounded.destroy();
      return res.status(200).json({ message: "Suppression de l'utilisateur et de ses posts réussie" });
    } catch (error) {
      console.log(error, "[ERROR]");
      return res.status(400).json(generateErrorMessage("Une erreur est survenue lors de la suppréssion"));
    }
  }
};

//get user via le token et non pas l'id
exports.getUserProfile = (req, res, next) => {
  //Récupération du userId
  try {
    const user = getUserFromToken(req);
    models.User.findOne({
      attributes: ["id", "email", "username", "bio", "createdAt", "updatedAt", "is_admin", "attachement"],
      where: { id: user.user_id },
    })
      .then((userFound) => {
        return res.status(200).json(userFound);
      })
      .catch((error) => {
        console.log(error);
        return res.status(404).json(generateErrorMessage("L'utilisateur n'a pas été trouvé"));
      });
  } catch (error) {
    console.log(error);
  }
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
