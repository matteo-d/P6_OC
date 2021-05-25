const express = require('express');

const router = express.Router();


//  Routes Enregistrement des Sauces dans la base de données (POST) ------------ !!! Attention ROUTES post avant Routes GET
router.post("/api/sauces", (req, res, next) => {
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
  router.get("/api/sauces", (req, res, next) => {
    Sauce.find()
      .then((sauces) => res.status(200).json(sauces))
      .catch((error) => res.status(400).json({ error }));
  });
  
  // Routes Récupération d'une sauce spécifique
  router.get("/api/sauces/:id", (req, res, next) => {
    // LE ":id" indique a express que la route est dynamique
    Sauce.findOne({ _id: req.params.id }) // Objet de comparaison en argument
      .then((sauce) => res.status(200).json(sauce))
      .catch((error) => res.status(404).json({ error }));
  });
  // Routes Mettez à jour une sauce existante
  router.put("/api/stuff/:id", (req, res, next) => {
    Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
      .then(() => res.status(200).json({ message: "Objet modifié !" }))
      .catch((error) => res.status(400).json({ error }));
  });
  // Route Suppression d'une sauce 
  router.delete('/api/sauces/:id', (req, res, next) => {
   Sauce.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
      .catch(error => res.status(400).json({ error }));
  });

module.exports = router;