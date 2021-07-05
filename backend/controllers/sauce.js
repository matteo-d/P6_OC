const Sauce = require('../models/Sauce')
const User = require('../models/User')
const verifyUserId = require('../middleware/auth')
const middlewareSauce = require('../middleware/sauce')
const middlewareUser = require('../middleware/user')
const fs = require('fs') // Pour pouvoir utiliser le filesystem (utile pour fonction deleteSauce)

//   Enregistrement des Sauces dans la base de données (POST) ------------ !!! Attention ROUTES post avant Routes GET

exports.createSauce = (req, res, next) => { 
if (req.body.sauce !== undefined) { 
  User.exists(
    // User.exist renvoi Boolean
    { _id: JSON.parse(req.body.sauce).userId },
    (error, userExist) => {
      // Verification que l'user Existe bien, Sauce heat -10 et requete contient une image

      if (
        userExist &&
        middlewareSauce.isValidHeat(JSON.parse(req.body.sauce).heat) &&
        middlewareUser.doJwtEgalUserId(
          verifyUserId.userId,
          JSON.parse(req.body.sauce).userId
        )
      ) {
        try {
          delete JSON.parse(req.body.sauce)._id
          const sauce = new Sauce({
            ...JSON.parse(req.body.sauce), // Opérateur spread pour dire que l'on copie les champs avec le schema de mongoose
            //Composition de l'URL :
            imageUrl: `${req.protocol}://${req.get('host')}/images/${
              req.file.filename //  req.protocol = http ou https, req.get("host") = localhost3000 ou racine server, /images/, req.file.filename
            }`
          })
          sauce
            .save() // Enregistre la sauce dans la DB et renvoie une promesses
            .then(() => res.status(201).json({ message: 'Objet enregistré !' })) // Une fois la réponse retournée faire un retour au frontend sinon dit que la requete n'est pas aboutie
            .catch(error => res.status(400).json({ error: error }))
        } catch {
          res.status(401).json({
            message: ' Vérifier le contenu de votre requête  '
          })
        }
      } else {
        res.status(401).json({
          message: ' Requête non autorisée  '
        })
      }
    }
  )
}
else {
  res.status(401).json({
    message: ' Corps de la requête non défini  '
  })
}
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
  const sauceObject = req.file
    ? // Est ce que l'image de la sauce est modifie
      Sauce.find({ _id: req.params.id }, (error, sauceExist) => {
        // Est ce que la sauce existe
        if (error || sauceExist.length == 0) {
          res.status(500).json({ message: " Oups ! Cette sauce n'existe pas " })
        } // Si la sauce existe bien
        else {
          User.exists(
            // Est ce que Cet utlisateur existe
            { _id: JSON.parse(req.body.sauce).userId },
            (error, userExist) => {
              if (userExist == false || error) {
                res.status(500).json({
                  message: " Oups ! Cet utilisateur n'existe pas  "
                })
              } else {
                // Est ce que la le heat de la sauce est compris entre 0 et 10 ET  est ce que le token correspond à l'userId du body de la request
                if (
                  middlewareSauce.isValidHeat(
                    JSON.parse(req.body.sauce).heat
                  ) &&
                  middlewareUser.doJwtEgalUserId(
                    verifyUserId.userId,
                    JSON.parse(req.body.sauce).userId
                  )
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
                    .then(() =>
                      res.status(200).json({ message: 'Objet modifié !' })
                    )
                    .catch(error => res.status(400).json({ error }))
                } else {
                  res.status(500).json({
                    message:
                      ' Oups ! Un problème est survenue lors de votre requete '
                  })
                }
              }
            }
          )
        }
      })
    : // Si requete sans modifs image
      Sauce.find({ _id: req.params.id }, (error, data) => {
        if (error || data.length == 0) {
          res.status(500).json({ message: " Oups ! Cette sauce n'existe pas " })
        } // Si la sauce existe bien
        else {
          User.exists({ _id: req.body.userId }, (error, userExist) => {
            if (userExist == false) {
              res.status(500).json({
                message:
                  ' Oups ! Un problème est survenue lors de votre requete '
              })
            } else {
              if (
                req.body.heat <= 10 &&
                req.body.heat >= 0 &&
                verifyUserId.userId == req.body.userId
              ) {
                const sauceObject = { ...req.body }
                Sauce.updateOne(
                  { _id: req.params.id },
                  { ...sauceObject, _id: req.params.id }
                )
                  .then(() =>
                    res.status(200).json({ message: 'Sauce modifié !' })
                  )
                  .catch(error => res.status(400).json({ error }))
              } else {
                res.status(500).json({
                  message: ' Oups ! Verifier le contenu de votre requête ',
                  error: error
                })
              }
            }
          })
        }
      })
  // Si requete sans modifs image
}

//  Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) // On va chercher avec findOne
    .then(sauce => {
      if (middlewareUser.doJwtEgalUserId(verifyUserId.userId, sauce.userId)) {
        const filename = sauce.imageUrl.split('/images/')[1] // Retourne un tableau avec ce qu'il y a avant et après images, on récupère le nom du fichier en [1]

        fs.unlink(`images/${filename}`, () => {
          // fs.unlink supprimer l'image au chemin indiqué
          Sauce.deleteOne({ _id: req.params.id }) // Une fois que l'image a été supprimer on supprime la sauce de la Base de donnée
            .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
            .catch(error => res.status(400).json({ error: error }))
        })
      } else {
        res.status(400).json({ message: 'Sauce inexistante ou Token erroné' })
      }
    })
}

// Gestion like / dislike
exports.likeSauce = (req, res, next) => {
  switch (req.body.like) {
    case 0: // Cas ou on annule son like / dislike
      Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
          if (
            sauce.usersLiked.find(user => user === req.body.userId) &&
            req.body.userId == verifyUserId
          ) {
            console.log(verifyUserId)
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

          if (
            sauce.usersDisliked.find(user => user === req.body.userId) &&
            req.body.userId == verifyUserId
          ) {
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
            sauce.usersLiked.find(user => user == req.body.userId) ==
              undefined &&
            req.body.userId == verifyUserId
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
          if (req.body.userId == verifyUserId) {
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
          } else {
            res
              .status(401)
              .json({
                message: "TOKEN ne correspond pas à l'userID de la requête"
              })
          }
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
          if (req.body.userId == verifyUserId) {
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
          } else {
            res
              .status(401)
              .json({
                message: "TOKEN ne correspond pas à l'userID de la requête"
              })
          }
        }
      })

      break
    default:
      res.status(400).json({
        error: 'OUPS ! Une erreur est survenue, vérifier votre requête'
      })
  }
}
