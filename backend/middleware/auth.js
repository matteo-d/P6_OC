const jwt = require("jsonwebtoken");
require("dotenv").config();
const TOKEN = process.env.TOKEN;

// Middleware d'authentification, Il va vérifier le token envoyé par el frontend avec sa requete,
// vérifie que le token est valable et que l'user id envoyé avec la  requete corresponde à l'user ID corresponde a celui encoder dans le token
module.exports = (req, res, next) => {
  try {
    
    const token = req.headers.authorization.split(" ")[1]; // Récupère le token dans le header de la requete qui s'appele authorization, renvoie tableau avec bearer en [0] et le token en [1], on récupere le token
    const decodedToken = jwt.verify(token, `${TOKEN}`); // On vérifier le token avec la clef secrete que l'on a créer dans controllers user
    const userId = decodedToken.userId; // On extrait le userId de l'objet  créer par decodedToken
  
    module.exports.userId = userId;
    
      next(); // si oui on laisse le script se dérouler car ce middleware est présent avant la logique métier des routes
    }
  catch {
    res.status(401).json({ message: " OUPS ! Identification impossible " }); // Error 500 = Error server
  }
}
