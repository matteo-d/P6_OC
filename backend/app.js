const express = require('express');
const app = express();




// MIDDLEWARE 
app.use((req, res, next) => { // 
  console.log('Requête reçue !');
  next(); // Renvoie au prochain middleware 
});

app.use((req, res, next) => {
  res.status(201); // Si le middleware d'avant marche, mettre le code 201 ( Requête réussi et ressource créer)
  next();
});

app.use((req, res, next) => {
  res.json({ message: 'Votre requête a bien été reçue !' }); // Si le middleware d'avant marche, dire que la reponse sera en format JSON et enverra a notre API la paire clé / valeur => message / texte
  next();
});

app.use((req, res) => {
  console.log('Réponse envoyée avec succès !'); // Si le middleware d'avant marche, console log
});

module.exports = app;