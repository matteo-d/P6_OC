const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const sauceModel = require("./models/Sauce"); // Import le models de sauce
const sauce = require("./models/Sauce");
// CONNECT TO MONGO DB
mongoose
  .connect(
    "mongodb+srv://sopeckocko:MRkkLPHmXfmwSSIh@cluster0.ntwtw.mongodb.net/P6_OC?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

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
app.use(bodyParser.json()); // Transforme le corp de la requete en JSON pour toutes les routes

//  Routes Enregistrement des Sauces dans la base de données (POST) ------------ !!! Attention ROUTES post avant Routes GET
app.post("/api/sauces", (req, res, next) => {
  delete req.body._id;
  const sauce = new Sauce({
    ...req.body,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
});
// Routes Récupération de la liste de Sauce en vente( GET )
app.get("/api/sauces", (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
});

// Routes Récupération d'une sauce spécifique
app.get("/api/sauces/:id", (req, res, next) => {
  // LE ":id" indique a express que la route est dynamique
  Sauce.findOne({ _id: req.params.id }) // Objet de comparaison en argument
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
});
// Routes Mettez à jour une sauce existante
app.put("/api/stuff/:id", (req, res, next) => {
  Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Objet modifié !" }))
    .catch((error) => res.status(400).json({ error }));
});
// Route Suppression d'une sauce 
app.delete('/api/sauces/:id', (req, res, next) => {
 Sauce.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
    .catch(error => res.status(400).json({ error }));
});
module.exports = app;
