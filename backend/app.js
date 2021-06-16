const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); // Mongoose est un package qui facilite les interactions avec notre base de données
require('dotenv').config()
const path = require("path");
const cors = require("cors");
const sauceRoutes = require("./routes/sauce.js");
const userRoutes = require("./routes/user.js");

const app = express();
// CONNECT TO MONGO DB
const ID = process.env.ID;
const MDP = process.env.MDP;
const ADDRESS = process.env.ADDRESS
mongoose
  .connect(
    `mongodb+srv://${ID}:${MDP}@${ADDRESS}`,
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
app.use(cors());
// ROUTES IMAGES
// express.static = dit a express de nosu servir le dossier static images
// gràce a path, on accède peut acceder aux chemins de notre systeme de fichier
app.use("/images", express.static(path.join(__dirname, "images"))); 
// ROUTES SAUCES
app.use("/api/sauces", sauceRoutes);
// ROUTES AUTH
app.use("/api/auth", userRoutes);

module.exports = app;
