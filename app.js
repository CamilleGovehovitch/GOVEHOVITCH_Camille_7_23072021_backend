const express = require('express');
const path = require('path');

const bodyParser = require('body-parser');

//Appel des variables d'environnement
const dotEnv = require('dotenv').config();

//Base de donnée mySql
//plutot mysql chercher des informations sur mysql2 et mysql comparaison plus simple plus moderne et rapide.
const mysql = require('mysql2');

//Connection à la base de donnée
const mysqlConnection = require('./connection/connection-db');

//Helmet protection
const helmet = require("helmet");

//ROUTES
const postsRoutes = require('./routes/postsRoutes');
const userRoutes = require('./routes/userRoutes');
// const responsesRoutes = require('./routes/responsesRoutes');



//Application express
const app = express();

//Body parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Helmet sécurisation
app.use(helmet());

// securisation avec les autorisation d'en tete
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/user', userRoutes);
app.use('/api/post', postsRoutes);
// app.use('api/responses', responsesRoutes);

module.exports = app;
