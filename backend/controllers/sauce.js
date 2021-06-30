const Sauce = require('../models/Sauce')
const User = require('../models/User')
const fs = require('fs') // Pour pouvoir utiliser le filesystem (utile pour fonction deleteSauce)

//   Enregistrement des Sauces dans la base de données (POST) ------------ !!! Attention ROUTES post avant Routes GET

exports.createSauce = (req, res, next) => {
  let sauceObject = JSON.parse(req.body.sauce)
  let userId = sauceObject.userId

  User.exists({ _id: userId }, (error, data) => {
    if (error) {
      res
        .status(500)
        .json({
          error: error,
          message:
            ' Oups ! Le serveur rencontre des problèmes, Veuillez réessayer ultérieurement'
        })
    } else {
      if (data == true) {
        switch (
          sauceObject.heat <= 10 &&
          req.file.filename.includes('undefined') === false
        ) {
          case true:
            delete sauceObject._id
            const sauce = new Sauce({
              ...sauceObject, // Opérateur spread pour dire que l'on copie les champs avec le schema de mongoose
              //Composition de l'URL :
              imageUrl: `${req.protocol}://${req.get('host')}/images/${
                req.file.filename //  req.protocol = http ou https, req.get("host") = localhost3000 ou racine server, /images/, req.file.filename
              }`
            })
            sauce
              .save() // Enregistre la sauce dans la DB et renvoie une promesses
              .then(() =>
                res.status(201).json({ message: 'Objet enregistré !' })
              ) // Une fois la réponse retournée faire un retour au frontend sinon dit que la requete n'est pas aboutie
              .catch(error => res.status(400).json({ error }))
            break

          case false:
            res.status(400).json({
              message:
                ' Oups ! Une erreur est survenue, vérifiez le contenu de la requête'
            })

          default:
            res.status(500).json({ message: 'Erreur serveur' })
        }
      } else {
        res.status(400).json({
          message: ' Oups ! ID utilisateur éroné'
        })
      }
    }
  })
}

//  Récupération d'une sauce spécifique
exports.getOneSauce = (req, res, next) => {
  // LE ":id" indique a express que la route est dynamique
  Sauce.findOne({ _id: req.params.id }) // Métode findOne cette fois-ci avec paramètre pour aller chercher l'élément dont l'ID corresponde a la sauce cherchée
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }))
}

//  Récupération de la liste de Sauce en vente( GET )
exports.getAllSauces = (req, res, next) => {
  Sauce.find() // Méthode find permet de retourner la liste complete des choses présente dans la DB
    .then(sauces => res.status(200).json(sauces)) // Si marche renvoie le tableau dans la DB
    .catch(error => res.status(400).json({ error }))
}

//  Modifier une sauce
exports.modifySauce = (req, res, next) => {
  Sauce.find({ _id: req.params.id }, (error, data) => {
    if (error) {
      res.status(500).json({ message: " Oups ! Cette sauce n'existe pas " })
    } // Si la sauce existe bien
    else {
      if (req.file) {
        // Si l'image est modifié
        let sauceData = JSON.parse(req.body.sauce)
        // Si l'id du produit = userId, heat de la sauce -10 et l'image est du bon format
        if (
          data[0].userId == sauceData.userId &&
          sauceData.heat <= 10 &&
          req.file.filename.includes('undefined') === false
        ) {
          const sauceObject = {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${
              req.file.filename
            }`
          }
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: 'Objet modifié !' }))
            .catch(error => res.status(400).json({ error }))
        } else {
          res.status(500).json({ message: 'Erreur serveur' })
        }
      } else {
        // Si la sauce est modifié sans mofication d'image
        if (data[0].userId == req.body.userId && req.body.heat <= 10) {
          // Si l'id du produit = userId, heat de la sauce -10
          const sauceObject = { ...req.body }
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: 'Objet modifié !' }))
            .catch(error => res.status(400).json({ error }))
        } else {
          res.status(500).json({ message: 'Erreur serveur' })
        }
      }
    }
  })
}

//  Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // On va chercher avec findOne
    .then(sauce => {
      sauce.userId
      const filename = sauce.imageUrl.split('/images/')[1] // Retourne un tableau avec ce qu'il y a avant et après images, on récupère le nom du fichier en [1]
      fs.unlink(`images/${filename}`, () => {
        // fs.unlink supprimer l'image au chemin indiqué
        Sauce.deleteOne({ _id: req.params.id }) // Une fois que l'image a été supprimer on supprime la sauce de la Base de donnée
          .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
          .catch(error => res.status(400).json({ error }))
      })
    })
    .catch(error => res.status(500).json({ error }))
}

// Gestion like / dislike
exports.likeSauce = (req, res, next) => {
  switch (req.body.like) {
    case 0: // Cas ou on annule son like / dislike
      Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
          if (sauce.usersLiked.find(user => user === req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: -1 },
                $pull: { usersLiked: req.body.userId },
                _id: req.params.id
              }
            )
              .then(() => {
                res.status(201).json({ messsage: 'Like annulé !  ' })
              })
              .catch(error => {
                res.status(400).json({
                  message:
                    'OUPS ! Une erreur est survenue, vérifier votre requête',
                  error: error
                })
              })
            // check that the user hasn't already diliked the sauce
          }

          if (sauce.usersDisliked.find(user => user === req.body.userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: req.body.userId },
                _id: req.params.id
              }
            )
              .then(() => {
                res.status(201).json({ messsage: 'Dislike annulé !  ' })
              })
              .catch(error => {
                res.status(400).json({
                  message:
                    'OUPS ! Une erreur est survenue, vérifier votre requête',
                  error: error
                })
              })
          }
          if (
            sauce.usersDisliked.find(user => user === req.body.userId) ==
              undefined &&
            sauce.usersLiked.find(user => user == req.body.userId) == undefined
          ) {
            res.status(400).json({ message: 'Aucun dislike ou like a annulé ' })
          }
        })
        .catch(error => {
          res.status(400).json({
            message: 'OUPS ! Une erreur est survenue, vérifier votre requête',
            error: error
          })
        })
      break
    //Updates likes. likes = 1

    case 1: // Cas ou on like
      Sauce.findOne({ _id: req.params.id }).then(sauce => {
        if (
          sauce.usersLiked.find(user => user === req.body.userId) ||
          sauce.usersDisliked.find(user => user === req.body.userId)
        ) {
          res.status(400).json({
            messsage:
              'Vous ne pouvez avoir plusieurs avis sur la même sauce, Envoyer 0 dans le corps de la requête pour annuler votre précédent avis '
          })
          // check that the user hasn't already diliked the sauce
        } else {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { likes: 1 },
              $push: { usersLiked: req.body.userId },
              _id: req.params.id
            }
          )
            .then(() => {
              res
                .status(201)
                .json({ message: 'Ton Like a été pris en compte!' })
            })
            .catch(error => {
              res.status(400).json({ error: error })
            })
        }
      })

      break

    case -1: // Cas ou on dislike
      Sauce.findOne({ _id: req.params.id }).then(sauce => {
        if (
          sauce.usersDisliked.find(user => user === req.body.userId) ||
          sauce.usersLiked.find(user => user === req.body.userId)
        ) {
          res.status(400).json({
            messsage:
              'Vous ne pouvez avoir plusieurs avis sur la même sauce, Envoyer 0 dans le corps de la requête pour annuler votre précédent avis '
          })
          // check that the user hasn't already diliked the sauce
        } else {
          Sauce.updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: 1 },
              $push: { usersDisliked: req.body.userId },
              _id: req.params.id
            }
          )
            .then(() => {
              res
                .status(201)
                .json({ message: 'Ton dislike a été pris en compte!' })
            })
            .catch(error => {
              res.status(400).json({ error: error })
            })
        }
      })

      break
    default:
      res.status(400).json({
        error: 'OUPS ! Une erreur est survenue, vérifier votre requête'
      })
  }
}
