const bcrypt = require("bcrypt"); // hash le mdp, pour vérifier si mdp est bon compare le hash du mdp entré avec le hash enregistré dans la DB.
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();
const TOKEN = process.env.TOKEN;

isValidPassword = (password) => {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/.test(password);
};

isValidEmail = (email) => {
    return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
        email
    );
};

maskEmail = (email) => {
    let str = email;
    str = str.split("");
    let finalArr = [];
    let len = str.indexOf("@");
    str.forEach((item, pos) => {
        pos >= 1 && pos <= len - 2
            ? finalArr.push("X")
            : finalArr.push(str[pos]);
    });
    let maskedEmail = finalArr.join("");
    return maskedEmail;
};

exports.signup = (req, res, next) => {
    // La fonction de hashage de bcrypt est asynchrone
    if (isValidPassword(req.body.password) && isValidEmail(req.body.email)) {
        bcrypt
            .hash(req.body.password, 10) // Ici on hash 10x le mdp
            .then((hash) => {
                // On récupère le hash du mdp
                const user = new User({
                    // Puis on créer un nouvel user
                    email: req.body.email, // On renregistre l'adresse qui est dans le corp de la requete ( ce que l'utilisateur a rentré )
                    password: hash, // Ici on enregistre bien directement le mdp crypté dans la DB et pas le mdp saisie
                    maskedEmail: maskEmail(req.body.email),
                });
                user.save() // On save le nouvel user dans la DB
                    .then(() =>
                        res.status(201).json({ message: "Utilisateur créé !" })
                    ) // Réponse vers le frontend sinon dis que la requete n'est pas aboutie
                    .catch((error) => res.status(400).json({ error })); // Error 400 = Bad request
            })
            .catch((error) => res.status(500).json({ error })); // Error 500 = Error server
    } else {
        res.status(401).json({
            message: "OUPS ! Votre mot de passe et/ou email est erroné ",
        }); // Error 500 = Error server
    }
};

exports.login = (req, res, next) => {
    // Permet aux users existant de se connecter
    User.findOne({ email: req.body.email }) // Cherche un seul utilisateur dont l'adresse mail correspond
        .then((user) => {
            if (!user) {
                return res.status(401).json({
                    error: "OUPS ! Mauvais identifiants de connexion, Veuillez Réessayer",
                }); // Si pas de match error 401 = Unauthorized
            }
            bcrypt
                .compare(req.body.password, user.password) // Fonction compare de bcrypt pour voir si mdp et hash matchs, renvoie boolean
                .then((valid) => {
                    if (!valid) {
                        return res.status(401).json({
                            error: "OUPS ! Mauvais identifiants de connexion, Veuillez Réessayer",
                        }); // Si pas de match error 401 = Unauthorized
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            // Fonction sign prends en param l'user Id , la clef de cryptage secrete
                            { userId: user._id }, // Payload, càd les données que l'on veut encoder
                            `${TOKEN}`, // Clef secrete (ou pas)
                            { expiresIn: "24h" } // Quand la clef secrete va exprirer
                        ),
                    });
                })
                .catch((error) => res.status(500).json({ error })); // Error 500 = Error server
        })
        .catch((error) => res.status(500).json({ error }));
};
