const mysql = require('mysql2');
const mysqlConnection = require('../connection/connection-db');


//Get topic
exports.getTopic = (req, res, next) => {
    console.log('route one topic');
    const topicsId = req.params.id;
    const query = 'SELECT * FROM Animal WHERE id=';
    mysqlConnection.query(query + topicsId, (err, rows, fields) => {
        if(!err) {
            res.status(200).json(rows);
        } else {
            console.log(err);
            res.status(404).json(err);
        }
    })
    console.log(req.params.id);
}

//Create topic
exports.createTopic = (req, res, next) => {
    const espece = req.body.espece;
    const sexe = req.body.sexe;
    const date_naissance = req.body.date_naissance;
    const nom = req.body.nom;
    const commentaire = req.body.commentaire;

    const query = 'INSERT INTO Animal (espece, sexe, date_naissance, nom, commentaires) VALUES (?, ?, ?, ?, ?)';

    mysqlConnection.query(query, [espece , sexe, date_naissance, nom, commentaire], function (err, data) {
        if (err) {
           console.log(err);
           res.status(400).json(err);
        } else {
            res.status(201).json({message: 'succefully inserted'});
        }
    });
}

//Modify topic
exports.modifyTopic = (req, res, next) => {
    console.log('MODIFY Topic');
    const topicsId = req.params.id;
    const espece = req.body.espece;
    const sexe = req.body.sexe;
    const date_naissance = req.body.date_naissance;
    const nom = req.body.nom;
    const commentaire = req.body.commentaire;

    const query = 'UPDATE Animal SET espece=?, sexe=?, date_naissance=?, nom=?, commentaires=? WHERE id=';
    mysqlConnection.query(query + topicsId, [espece, sexe, date_naissance, nom, commentaire], function (err, data) {
        if (err) {
            console.log(err);
            res.status(400).json(err);
        } else {
            res.status(201).json({message: 'succefully updated'});

        }
    })
}

//Delete topic
exports.deleteTopic = (req, res, next) => {

}

//Get all topics
exports.getTopics = (req, res, next) => {
    console.log('GET TOPICS');
    mysqlConnection.query("SELECT * FROM Animal", (err, rows, fields) => {
        if(!err) {
            res.status(200).json(rows);
        } else {
            console.log(err);
            res.status(404).json(err);
        }
    });
}
