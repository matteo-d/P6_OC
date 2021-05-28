const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true);
const path = require("path");
const cors = require("cors");
const sauceRoutes = require("./routes/sauce.js");
const userRoutes = require("./routes/user.js");

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

app.use('/api/sauces', (req, res, next) => {
  const sauces = [
    {
      userId: 'Mon premier objet',
      name: 'Mon premier objet',
      manufacturer: 'Mon premier objet',
      description: 'Mon premier objet',
      mainPepper: 'Mon premier objet',
      imageUrl: 'https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg',
      heat:'Mon premier objet',

    },
    {
      userId: 'Mon premier objet',
      name: 'Mon premier objet',
      manufacturer: 'Mon premier objet',
      description: 'Mon premier objet',
      mainPepper: 'Mon premier objet',
      imageUrl: 'https://cdn.pixabay.com/photo/2019/06/11/18/56/camera-4267692_1280.jpg',
      heat:'Mon premier objet',

    },
  ];
  res.status(200).json(sauces);
});
// BODY PARSER
app.use(bodyParser.json()); // Transforme le corp de la requete en JSON pour toutes les routes
app.use(cors());
// ROUTES IMAGES
app.use("/images", express.static(path.join(__dirname, "images")));
// ROUTES SAUCES
app.use("/api/sauces", sauceRoutes);
// ROUTES AUTH
app.use("/api/auth", userRoutes);

module.exports = app;
