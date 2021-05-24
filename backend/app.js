const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const userRoutes = require('./routes/users.js');
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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

// ROUTE POST SAUCE
  app.post('/api/sauces', (req, res, next) => {
    console.log(req.body);
    res.status(201).json({
      message: 'Objet créé !'
    });
  });
// ROUTE AUTH 
  app.use('/api/auth', userRoutes);
app.use(bodyParser.json());





module.exports = app;