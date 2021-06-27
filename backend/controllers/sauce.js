const Sauce = require("../models/Sauce");
const fs = require("fs"); // Pour pouvoir utiliser le filesystem (utile pour fonction deleteSauce)
const User = require("../models/User");
//   Enregistrement des Sauces dans la base de données (POST) ------------ !!! Attention ROUTES post avant Routes GET

 


exports.createSauce = (req, res, next) => {


  const sauceObject = JSON.parse(req.body.sauce); // On extrait le JSON de la sauce

  console.log(sauceObject.userId)
  let userId = sauceObject.userId
  console.log(userId)

  User.find({ _id:userId}, (error,data) => {
    if (error) {
      console.log(error)
      console.log('error')
      res.status(400).json({ message: " Oups ! Une erreur est survenue, vérifiez le contenu de la requête" });
    }
    else  {
      console.log(data)
      switch (sauceObject.heat <= 10 && req.file.filename.includes("undefined") === false  ){
        case true:
          delete sauceObject._id;
        const sauce = new Sauce({
          ...sauceObject, // Opérateur spread pour dire que l'on copie les champs avec le schema de mongoose
           //Composition de l'URL :
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
           
            req.file.filename //  req.protocol = http ou https, req.get("host") = localhost3000 ou racine server, /images/, req.file.filename
          }`,
        });
      
        sauce
          .save() // Enregistre la sauce dans la DB et renvoie une promesse
          .then(() => res.status(201).json({ message: "Objet enregistré !" })) // Une fois la réponse retournée faire un retour au frontend sinon dit que la requete n'est pas aboutie
          .catch((error) => res.status(400).json({ error }));
          break;
        case false:
          res.status(400).json({ message: " Oups ! Une erreur est survenue, vérifiez le contenu de la requête" });
      
        default:
          res.status(500).json({ message: "Erreur serveur" });
      }
    }
  });

  
  }

   
  


 
//  Récupération d'une sauce spécifique
exports.getOneSauce = (req, res, next) => {
  // LE ":id" indique a express que la route est dynamique
  Sauce.findOne({ _id: req.params.id }) // Métode findOne cette fois-ci avec paramètre pour aller chercher l'élément dont l'ID corresponde a la sauce cherchée
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

//  Récupération de la liste de Sauce en vente( GET )
exports.getAllSauces = (req, res, next) => {
  Sauce.find() // Méthode find permet de retourner la liste complete des choses présente dans la DB
    .then((sauces) => res.status(200).json(sauces)) // Si marche renvoie le tableau dans la DB
    .catch((error) => res.status(400).json({ error }));
};

//  Mettez à jour une sauce existante
exports.modifySauce = (req, res, next) => {

  console.log(req.body.userId)

  Sauce.find({ _id: req.params.id}, (error,data) => {
    if (error) {
      console.log(error)
      console.log('error')
      res.status(400).json({ message: " Oups ! Une erreur est survenue, vérifiez le contenu de la requête" });
    }
    else  {
    if(data[0].userId == req.body.userId )  {
      const sauceObject = req.file // Ici vérifie si on est dans le cas d'une nouvelle image
    ? { // Si Oui
      
        ...JSON.parse(req.body.sauce), // On recupère les infos sur l'objet
        imageUrl: `${req.protocol}://${req.get("host")}/images/${ // On génère l'image URL
          req.file.filename
        }`,
      }
    : { ...req.body }; // Si non prends seulement le corep de la requete normale
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Objet modifié !" }))
    .catch((error) => res.status(400).json({ error }));
}
else {
  res.status(400).json({ message : " Mauvais UserID " });
}
}

})
  
  };
    

//  Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // On va chercher avec findOne
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1]; // Retourne un tableau avec ce qu'il y a avant et après images, on récupère le nom du fichier en [1]
      fs.unlink(`images/${filename}`, () => { // fs.unlink supprimer l'image au chemin indiqué
        Sauce.deleteOne({ _id: req.params.id }) // Une fois que l'image a été supprimer on supprime la sauce de la Base de donnée
          .then(() => res.status(200).json({ message: "Objet supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

//Like a sauce
exports.likeSauce = (req, res, next) => {
  switch (req.body.like) {
    // Défault = 0
    // Check that the user hasn't already liked the sauce
    case 0:
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          if (sauce.usersLiked.find((user) => user === req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: -1 },
                $pull: { usersLiked: req.body.userId },
                _id: req.params.id,
              }
            )
              .then(() => {
                res
                  .status(201)
                  .json({ message: "Ton avis a été pris en compte!" });
              })
              .catch((error) => {
                res.status(400).json({ error: error });
              });

            // check that the user hasn't already diliked the sauce
          }
          if (sauce.usersDisliked.find((user) => user === req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.body.userId },
                _id: req.params.id,
              }
            )
              .then(() => {
                res
                  .status(201)
                  .json({ message: "Ton avis a été pris en compte!" });
              })
              .catch((error) => {
                res.status(400).json({ error: error });
              });
          }
        })
        .catch((error) => {
          res.status(404).json({ error: error });
        });
      break;
    //Updates likes. likes = 1
    case 1:
      Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
          $push: { usersLiked: req.body.userId },
          _id: req.params.id,
        }
      )
        .then(() => {
          res.status(201).json({ message: "Ton like a été pris en compte!" });
        })
        .catch((error) => {
          res.status(400).json({ error: error });
        });
      break;

    //Updates dislikes. dislikes = -1
    case -1:
      Sauce.updateOne(
        { _id: req.params.id },
        {
          $inc: { dislikes: 1 },
          $push: { usersDisliked: req.body.userId },
          _id: req.params.id,
        }
      )
        .then(() => {
          res
            .status(201)
            .json({ message: "Ton dislike a été pris en compte!" });
        })
        .catch((error) => {
          res.status(400).json({ error: error });
        });
      break;
    default:
      console.error("mauvaise requête");
  }
};