const express = require('express');
const path = require('path');

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
const topicsRoutes = require('./routes/topicsRoutes');

const app = express();
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

app.use('/api/topics', topicsRoutes);

module.exports = app;
