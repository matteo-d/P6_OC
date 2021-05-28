const express = require("express");

const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const path = require('path');

// const sauceRoutes = require('./routes/sauce.js');
const userRoutes = require('./routes/user.js');

const app = express();
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


// ROUTES IMAGES 
app.use('/images', express.static(path.join(__dirname, 'images')));
// ROUTES SAUCES
//app.use('/api/sauces', sauceRoutes)
// ROUTES AUTH
app.use('/api/auth', userRoutes)

module.exports = app;
