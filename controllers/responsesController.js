const mysql = require('mysql2');
const mysqlConnection = require('../connection/connection-db');
const jwt = require('jsonwebtoken');

exports.getResponses = (req, res, next) => {
    console.log('hello responses');
}

//Create Response 
exports.createResponse = (req, res, next) => {
    console.log('hello response routes');
    console.log(req.params);
    //Récupération du post id
    const postId = req.params.id;
    console.log(postId);

    //Récupération du user id
    const user = getUserFromToken(req);
    console.log(user.user_id);

    //Params
    const content = req.body.content;
    const attachement = req.body.attachement;

    models.User.findOne({
        attributes: ['id'],
        where: {id: user.user_id}
    })
    .then( (userFound) => {
        models.Post.findOne({
            attributes: ['id'],
            where: { id: postId}
        })
        .then((postFound) => {
            console.log(req.body);
            console.log(postFound);
            
            models.PostResponse.create({
                content: content,
                ParentPostId: postFound.id,
                UserId: user.user_id
            })
            .then( () => {
                console.log(req.body);
                return res.status(201).json({'message': 'Réponse créée avec succes'});
            })
            .catch((error) => {
                console.log(error);
                return res.status(500).json(generateErrorMessage('Une erreur est survenue'));
            })
        })
        .catch((error) => {
            console.log(error);
            return res.status(404).json(generateErrorMessage('Post non trouvé'));
        })        
    })
    .catch( (error) => {
        console.log(error);
        return res.status(404).json(generateErrorMessage(USER_NOT_FOUND));
    })
}