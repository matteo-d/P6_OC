const express = require('express');
const bodyParser = require('body-parser'); //capables d'extraire l'objet JSON de la demande. Il nous faudra le package body-parser
const app = express();
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://new-user_01:WJlBcoiwlsdyPfr4@cluster0.fhzep.mongodb.net/soPeckockoDB?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(bodyParser.json()); // Certainement pour faire des trucs 


module.exports = app;
