const express = require("express");
const path = require("path");

//Appel des variables d'environnement
const dotEnv = require("dotenv").config();

//Multer
const multer = require("multer");

//Helmet protection
const helmet = require("helmet");

//ROUTES
const postsRoutes = require("./routes/postsRoutes");
const userRoutes = require("./routes/userRoutes");
// const responsesRoutes = require('./routes/responsesRoutes');

//Application express
const app = express();

app.use(express.json());

//Helmet sécurisation
app.use(helmet());

// securisation avec les autorisation d'en tete
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  next();
});

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/user", userRoutes);
app.use("/api/post", postsRoutes);
// app.use('api/responses', responsesRoutes);

module.exports = app;

//Commenter ttes les lignes mysql et db la connection se fait a partir de sequelize !!!
