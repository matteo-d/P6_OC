const express = require("express");
const app = express();

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
// MIDDLEWARE

// METTRE DES SAUCES EN VENTES
app.use("/api/sauces", (req, res, next) => {
  const sauce = [
    {
      userId: "identifiant unique créé par MongoDB",
      name: " nom de la sauce",
      manufacturer: " fabricant de la sauce ",
      description: " description de la sauce ",
      mainPepper: " principal ingrédient dans la sauce",
      imageUrl: "URL de l'image téléchargé par l'utilisateur",
      heat: "MUST BE A NUMBER",
      likes: "MUST BE A NUMBER",
      dislikes: "MUST BE A NUMBER",
      usersLiked: "tableau d'identifiants d'utilisateurs ayant aimé la sauce",
      usersDisliked:
        "tableau d'identifiants d'utilisateurs n'ayant pas aimé la sauce",
    },
  ];
  res.status(200).json(sauce); // Si la réponse est de statut 200 (Réussite de la requete) mets l'objet sauce en JSON et display le dans l'API
});

module.exports = app;
