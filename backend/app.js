const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path');
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
// BODY PARSER 
app.use(bodyParser.json()); // Transforme le corp de la requete en JSON pour toutes les routes

// ROUTES SAUCES
app.use('/api/sauces', sauceRoutes)
// ROUTES AUTH
app.use('/api/auth', userRoutes)
// ROUTES IMAGES 
app.use('/images', express.static(path.join(__dirname, 'images')));
module.exports = app;
