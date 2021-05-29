const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Récupère le token dans le header de la requete authorization,on récupère ce qu'il y a après " Bearer" 
    const decodedToken = jwt.verify(token,'RANDOM_TOKEN_SECRET'); // On vérifier le token avec le toke nque l'on a créer dans controllers user
    const userId = decodedToken.userId; // On extrait le userId de l'objet Javascript créer par decodedToken
    if (req.body.userId && req.body.userId !== userId) { // on vérifie que l'User Id  correspond bien au token d'utilisateur , si oui on next 
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};
