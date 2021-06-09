const bcrypt = require("bcrypt"); // hash le mdp, pour vérifier si mdp est bon compare le hash du mdp entré avec le hash enregistré dans la DB.
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Routes Récupération de la liste de Sauce en vente( GET )

exports.signup = (req, res, next) => { // La fonction de hashage de bcrypt est asynchrone
  bcrypt
    .hash(req.body.password, 10) // Ici on hash 10x le mdp 
    .then((hash) => { // On récupère le hash du mdp 
      const user = new User({ // Puis on créer un nouvel user
        email: req.body.email, // On renregistre l'adresse qui est dans le corp de la requete ( ce que l'utilisateur a rentré )
        password: hash, // Ici on enregistre bien directement le mdp crypté dans la DB et pas le mdp saisie
      });
      user
        .save() // On save le nouvel user dans la DB 
        .then(() => res.status(201).json({ message: "Utilisateur créé !" })) // Réponse vers le frontend sinon dis que la requete n'est pas aboutie
        .catch((error) => res.status(400).json({ error })); // Error 400 = Bad request
    })
    .catch((error) => res.status(500).json({ error })); // Error 500 = Error server 
};

exports.login = (req, res, next) => { // Permet aux users existant de se connecter 
  User.findOne({ email: req.body.email }) // Cherche un seul utilisateur dont l'adresse mail correspond
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' }); // Si pas de match error 401 = Unauthorized
      }
      bcrypt.compare(req.body.password, user.password) // Fonction compare de bcrypt pour voir si mdp et hash matchs, renvoie boolean
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' }); // Si pas de match error 401 = Unauthorized
          }
          res.status(200).json({ 
            userId: user._id,
            token: jwt.sign( // Fonction sign prends en param l'user Id , la clef de cryptage secrete
              { userId: user._id }, // Payload, càd les données que l'on veut encoder
              'RANDOM_TOKEN_SECRET', // Clef secrete (ou pas)
              { expiresIn: '24h' } // Quand la clef secrete va exprirer
            )
          });
        })
        .catch(error => res.status(500).json({ error })); // Error 500 = Error server 
    })
    .catch(error => res.status(500).json({ error }));
};