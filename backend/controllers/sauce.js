const Sauce = require("../models/Sauce");
const User = require("../models/User");
const verifyUserId = require("../middleware/auth");
const fs = require("fs");

// Does the JSON WEB TOKEN egal userId
doJwtEgalUserId = (tokenUserId, userId) => {
    if (tokenUserId == userId) {
        return true;
    }
};

isValidPassword = (password) => {
    return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/.test(password);
};

isValidEmail = (email) => {
    return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
        email
    );
};

isValidHeat = (heat) => {
    try {
        if (heat <= 10 && heat >= 0) {
            return true;
        } else {
            return false;
        }
    } catch {
        res.status(500).json({
            message: " Oups ! Un problème est survenu lors de votre requête  ",
        });
    }
};

isValidSauceSchema = (req) => {
    const neededKeys = [
        "name",
        "manufacturer",
        "description",
        "mainPepper",
        "heat",
        "userId",
    ];

    if (neededKeys.every((elem) => Object.keys(req).includes(elem)))
        return true;
};
// Vérifie que l'objet ne contient pas de value égale a undefined, null ou empty string
checkValuesValidity = (sauce) => {
    let arr = [];
    for (let key in sauce) {
        arr.push(
            sauce[key] !== undefined && sauce[key] !== null && sauce[key] !== ""
        );
    }
    return arr.includes(false);
};
doUserExist = async (userId) => {
    try {
        const user = await User.exists(
            // Est ce que Cet utlisateur existe ?
            { _id: userId }
        );
    } catch {
        res.status(500).json({
            message: " Oups ! Cet utilisateur n'existe pas  ",
        });
    }
};

findSauce = async (sauceId) => {
    try {
        const sauce = await Sauce.find({ _id: sauceId });
    } catch {
        res.status(500).json({
            message: " Oups ! Cette sauce n'existe pas  ",
        });
    }
};

exports.createSauce = (req, res, next) => {
    if (
        req.body.sauce !== undefined &&
        isValidSauceSchema(JSON.parse(req.body.sauce)) &&
        doUserExist(JSON.parse(req.body.sauce).userId) &&
        isValidHeat(JSON.parse(req.body.sauce).heat) &&
        doJwtEgalUserId(verifyUserId.userId, JSON.parse(req.body.sauce).userId)
    ) {
        try {
            delete JSON.parse(req.body.sauce)._id;
            const sauce = new Sauce({
                ...JSON.parse(req.body.sauce), // Opérateur spread pour dire que l'on copie les champs avec le schema de mongoose
                //Composition de l'URL :
                imageUrl: `${req.protocol}://${req.get("host")}/images/${
                    req.file.filename //  req.protocol = http ou https, req.get("host") = localhost3000 ou racine server, /images/, req.file.filename
                }`,
            });
            sauce
                .save() // Enregistre la sauce dans la DB et renvoie une promesses
                .then(() =>
                    res.status(201).json({ message: "Objet enregistré !" })
                )
                .catch((error) => res.status(400).json({ error: error }));
        } catch {
            res.status(401).json({
                message: " Vérifier le contenu de votre requête  ",
            });
        }
    } else {
        res.status(401).json({
            message: " Requête non autorisée  ",
        });
    }
};

//  Récupération d'une sauce spécifique
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => res.status(404).json({ error }));
};

//  Récupération de la liste de Sauce en vente
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => res.status(400).json({ error }));
};

//  Modifier une sauce
exports.modifySauce = (req, res, next) => {
    switch (
        req.file == undefined // Si la modification n'inclut pas un changement d'image
    ) {
        case true:
            try {
                let sauce = req.body;

                if (
                    sauce !== undefined &&
                    checkValuesValidity(sauce) == false &&
                    isValidHeat(sauce.heat) &&
                    doJwtEgalUserId(verifyUserId.userId, sauce.userId) &&
                    doUserExist(sauce.userId) &&
                    findSauce(req.params.id)
                ) {
                    const sauceObject = { ...req.body };
                    Sauce.updateOne(
                        { _id: req.params.id },
                        { ...sauceObject, _id: req.params.id }
                    )
                        .then(() =>
                            res.status(200).json({
                                message: "OK ! Sauce modifié !",
                            })
                        )
                        .catch((error) => res.status(400).json({ error }));
                } else {
                    res.status(500).json({
                        message: " Oups ! Requête non valide ",
                    });
                }
            } catch {
                res.status(500).json({
                    message: " Oups ! Requête impossible ",
                });
            }

            break;

        case false:
            try {
                let sauce = JSON.parse(req.body.sauce);

                if (
                    sauce !== undefined &&
                    checkValuesValidity(sauce) == false &&
                    isValidHeat(sauce.heat) &&
                    doJwtEgalUserId(verifyUserId.userId, sauce.userId) &&
                    doUserExist(sauce.userId) &&
                    findSauce(req.params.id)
                ) {
                    // Supprime l'ancienne image avant remplacement par nouvelle image
                    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
                        const filename = sauce.imageUrl.split("/images/")[1]; // Retourne un tableau avec ce qu'il y a avant et après images, on récupère le nom du fichier en [1]

                        fs.unlink(`images/${filename}`, () => {
                            // fs.unlink supprimer l'image au chemin indiqué
                        });
                    });

                    const sauceObject = {
                        ...sauce,
                        imageUrl: `${req.protocol}://${req.get(
                            "host"
                        )}/images/${req.file.filename}`,
                    };

                    Sauce.updateOne(
                        { _id: req.params.id },
                        { ...sauceObject, _id: req.params.id }
                    )
                        .then(() =>
                            res.status(200).json({
                                message: "Objet modifié !",
                            })
                        )
                        .catch((error) => res.status(400).json({ error }));
                } else {
                    res.status(500).json({
                        message: " Oups ! Requête non valide ",
                    });
                }
            } catch {
                res.status(500).json({
                    message: " Oups ! Requête Imposssible ",
                });
            }
            break;

        default:
            res.status(500).json({
                message: " Oups ! Requête Imposssible ",
            });
    }
};

//  Suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
        if (doJwtEgalUserId(verifyUserId.userId, sauce.userId)) {
            const filename = sauce.imageUrl.split("/images/")[1]; // Retourne un tableau avec ce qu'il y a avant et après images, on récupère le nom du fichier en [1]

            fs.unlink(`images/${filename}`, () => {
                // fs.unlink supprimer l'image au chemin indiqué
                Sauce.deleteOne({ _id: req.params.id }) // Une fois que l'image a été supprimer on supprime la sauce de la Base de donnée
                    .then(() =>
                        res.status(200).json({ message: "Objet supprimé !" })
                    )
                    .catch((error) => res.status(400).json({ error: error }));
            });
        } else {
            res.status(400).json({
                message: "OUPS ! Impossible de supprimer cette sauce",
            });
        }
    });
};

// Handle / dislike
exports.likeSauce = (req, res, next) => {
    switch (req.body.like) {
        case 0: // Remove like / dislike
            Sauce.findOne({ _id: req.params.id })
                .then((sauce) => {
                    if (
                        sauce.usersLiked.find(
                            (user) => user === req.body.userId
                        ) &&
                        req.body.userId == verifyUserId.userId
                    ) {
                        Sauce.updateOne(
                            { _id: req.params.id },
                            {
                                $inc: { likes: -1 },
                                $pull: { usersLiked: req.body.userId },
                                _id: req.params.id,
                            }
                        )
                            .then(() => {
                                res.status(201).json({
                                    messsage: "Like annulé !  ",
                                });
                            })
                            .catch((error) => {
                                res.status(400).json({
                                    message:
                                        "OUPS ! Une erreur est survenue, vérifier votre requête",
                                    error: error,
                                });
                            });
                        // check that the user hasn't already disliked the sauce
                    }

                    if (
                        sauce.usersDisliked.find(
                            (user) => user === req.body.userId
                        ) &&
                        req.body.userId == verifyUserId.userId
                    ) {
                        Sauce.updateOne(
                            { _id: req.params.id },
                            {
                                $inc: { dislikes: -1 },
                                $pull: { usersDisliked: req.body.userId },
                                _id: req.params.id,
                            }
                        )
                            .then(() => {
                                res.status(201).json({
                                    messsage: "Dislike annulé !  ",
                                });
                            })
                            .catch((error) => {
                                res.status(400).json({
                                    message:
                                        "OUPS ! Une erreur est survenue, vérifier votre requête",
                                    error: error,
                                });
                            });
                    }
                    if (
                        sauce.usersDisliked.find(
                            (user) => user === req.body.userId
                        ) == undefined &&
                        sauce.usersLiked.find(
                            (user) => user == req.body.userId
                        ) == undefined &&
                        req.body.userId == verifyUserId.userId
                    ) {
                        res.status(400).json({
                            message: "Aucun dislike ou like a annulé ",
                        });
                    }
                })
                .catch((error) => {
                    res.status(400).json({
                        message:
                            "OUPS ! Une erreur est survenue, vérifier votre requête",
                        error: error,
                    });
                });
            break;
        //Updates likes. likes = 1

        case 1: // Cas ou on like
            Sauce.findOne({ _id: req.params.id }).then((sauce) => {
                if (
                    sauce.usersLiked.find((user) => user === req.body.userId) ||
                    sauce.usersDisliked.find((user) => user === req.body.userId)
                ) {
                    res.status(400).json({
                        messsage:
                            "Vous ne pouvez avoir plusieurs avis sur la même sauce, Envoyer 0 dans le corps de la requête pour annuler votre précédent avis ",
                    });
                    // check that the user hasn't already diliked the sauce
                } else {
                    if (req.body.userId == verifyUserId.userId) {
                        Sauce.updateOne(
                            { _id: req.params.id },
                            {
                                $inc: { likes: 1 },
                                $push: { usersLiked: req.body.userId },
                                _id: req.params.id,
                            }
                        )
                            .then(() => {
                                res.status(201).json({
                                    message: "Ton Like a été pris en compte!",
                                });
                            })
                            .catch((error) => {
                                res.status(400).json({ error: error });
                            });
                    } else {
                        res.status(401).json({
                            message:
                                "TOKEN ne correspond pas à l'userID de la requête",
                        });
                    }
                }
            });

            break;

        case -1: // Cas ou on dislike
            Sauce.findOne({ _id: req.params.id }).then((sauce) => {
                if (
                    sauce.usersDisliked.find(
                        (user) => user === req.body.userId
                    ) ||
                    sauce.usersLiked.find((user) => user === req.body.userId)
                ) {
                    res.status(400).json({
                        messsage:
                            "Vous ne pouvez avoir plusieurs avis sur la même sauce, Envoyer 0 dans le corps de la requête pour annuler votre précédent avis ",
                    });
                    // check that the user hasn't already diliked the sauce
                } else {
                    if (req.body.userId == verifyUserId.userId) {
                        Sauce.updateOne(
                            { _id: req.params.id },
                            {
                                $inc: { dislikes: +1 },
                                $push: { usersDisliked: req.body.userId },
                                _id: req.params.id,
                            }
                        )
                            .then(() => {
                                res.status(201).json({
                                    message:
                                        "Ton dislike a été pris en compte!",
                                });
                            })
                            .catch((error) => {
                                res.status(400).json({ error: error });
                            });
                    } else {
                        res.status(401).json({
                            message:
                                "TOKEN ne correspond pas à l'userID de la requête",
                        });
                    }
                }
            });

            break;
        default:
            res.status(400).json({
                error: "OUPS ! Une erreur est survenue, vérifier votre requête",
            });
    }
};
