const express = require("express");
const path = require("path");

//Appel des variables d'environnement
const dotEnv = require("dotenv").config();

//Multer
const multer = require("multer");

//Helmet protection
const helmet = require("helmet");

//ROUTES
const userRoutes = require("./routes/userRoutes");
const postsRoutes = require("./routes/postsRoutes");
const commentRoutes = require("./routes/commentRoutes");

//Application express
const app = express();

app.use(express.json());

//Helmet sécurisation
app.use(helmet());

// securisation avec les autorisation d'en tete
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization, Cache-Control" );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/user", userRoutes);
app.use("/api/post", postsRoutes);
app.use('/api/comment', commentRoutes);

module.exports = app;

//Commenter ttes les lignes mysql et db la connection se fait a partir de sequelize !!!
