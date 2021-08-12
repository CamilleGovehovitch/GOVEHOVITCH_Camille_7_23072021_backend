const mysql = require('mysql2');

//Connection My Sql
const mysqlConnection = require('../connection/connection-db');

//Models
const models = require('../models');

//Sécurité
const bcrypt = require('bcrypt');
const Maskdata = require('maskdata');
const jwt = require('jsonwebtoken');

//Check password strength
const { passwordStrength } = require('check-password-strength');

//Mask Options
const emailMask2Options = {
    maskWith: "*", 
    unmaskedStartCharactersBeforeAt: 10,
    unmaskedEndCharactersAfterAt: 5,
    maskAtTheRate: false
};

//Regex
const emailRegex = new RegExp('^[a-zA-Z-0-9._-]+@[a-z0-9._-]{2,}\.[a-z]{2,4}$');

//Signup
exports.signUp = (req, res, next) => {
    //Params
    const email = req.body.email;
    const password = req.body.password;
    const bio = req.body.bio;
    const username = req.body.username;
 
    //Masked params
    const emailMasked = Maskdata.maskEmail2(req.body.email, emailMask2Options);
    const passwordStrengthTested = passwordStrength(req.body.password).value;
    
    if(email === null || password === null || username === null) {
        return res.status(400).json({error: 'Missing Parameters'});
    }
    if(!email.match(emailRegex)) {
        console.log('err');
        return res.status(400).json({error: 'Votre email n\'a pas la forme requise'});
    }
    if(passwordStrengthTested !== 'Strong') {
        return res.status(401).json({message: 'password ' + passwordStrengthTested});
      }

    models.User.findOne({
        attributes: ['email'],
        where: {email: email}
    })
    .then(function(userFound){
        if(!userFound) {
            bcrypt.hash(password, 10, (err, bcryptedPassword) => {
                let newUser = models.User.create({
                    email: emailMasked,
                    username: username,
                    password: bcryptedPassword,
                    bio: bio,
                    is_admin: 0
                })
                .then(function(newUser){
                    return res.status(201).json({
                        userId: newUser.id
                    })
                })
                .catch(function(err){
                    console.log(err);
                    res.status(400).json({'error': 'L\'utilisateur existe déjà'});
                })
            })
        } else {
            return res.status(409).json({'error': 'L\'utilisateu existe déjà'});
        }
    })
    .catch(function(err){
        console.log(err);
        return res.status(500).json({'error': 'L\'utilisateur est introuvable'});
    })
}

//Login
exports.login = (req, res, next) => {
    console.log('hey route login');
    const userEmailMasked = Maskdata.maskEmail2(req.body.email, emailMask2Options);

    let email = req.body.email;
    let password = req.body.password;
    console.log(req.body);

    if(email == '' || password == '') {
        return res.status(400).json({error: 'Les champs email et password doivent être remplis'});
    }
        //Récupération du user en comparant l'email de la requete à l'email en bdd
        models.User.findOne({
            where: {email: userEmailMasked}
        })
        .then(function(userFound){
            if(userFound) {
                console.log(userFound.id);
                //Bycrypt compare le password de la requete à celui sâlé en bdd avec la même clé
                bcrypt.compare(password, userFound.password, (err, resBcrypt) => {
                    if(resBcrypt) {
                        return res.status(200).json({
                            userId: userFound.id,
                            token: jwt.sign(
                                {user_id: userFound.id},
                                process.env.DB_SECRET,
                                { expiresIn: '24h' },
                                {is_admin: userFound.is_admin}
                            )
                        })
                    }
                })
            } else {
                return res.status(404).json({'error': 'L\'utilisateur n\'existe pas en base de donnée'});
            }
        })
        .catch(function(err){
            console.log(err);
           return res.status(500).json({'error':'unable to verify'});
        })

}

//Edit user
exports.editProfile = (req, res, next) => {
    console.log('hello');
    //Params
    const email = req.body.email;
    const bio = req.body.bio;

    //Récupération du userId
    const auth = req.headers.authorization.split(' ')[1]; 
    const decodedToken = jwt.verify(auth, process.env.DB_SECRET);
    const userId = decodedToken.user_id;

    models.User.findOne({
        attributes: ['id', 'email', 'bio'],
        where: {id: userId}
    })
    .then((userFound) => {
        console.log(userFound);
        userFound.update({
            email: (email ? email : userFound.email),
            bio: (bio ? bio : userFound.bio)
        })
        .then(() => {
            console.log(userFound);
            return res.status(201).json(userFound);
        })
        .catch((error) => {
            return res.status(500).json({'error': 'L\'utilisateur n\'a pu être mis à jour'});
        })
    })
    .catch((error) => {
        console.log(error);
        return res.status(404).json({'error': 'User not found'});
    })
}