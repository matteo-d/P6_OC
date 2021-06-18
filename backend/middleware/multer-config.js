const multer = require("multer");
// Configuration de multer


const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({ // diskStorage = on va l'enregistré dans le disque, prends 2params : destination et filename
  destination: (req, file, callback) => {
    callback(null, "images"); // null pour dire qu'il n'y a pas eu d'erreur ici, et images pour dire qu'on enrigistre ficheir entrant dans dossier images 
  },
  filename: (req, file, callback) => { // Génère un nouveau nom pour le fichier 
    const name = file.originalname.split(" ").join("_"); // On utlise le nom d'origine du fichier, on empeche les whitespace que l'on remplace par des underscore pour éviter les erreur coté serveur
    const extension = MIME_TYPES[file.mimetype]; // On va générer les extensions de fichiers selon l'extension de base ( voir const MIME_TYPES)
    callback(null, name + Date.now() + "." + extension); // On rajoute un timestamp au nom du fichier pour le rendre plus unique
  },
  // Résultat du middleware = name + date + extension
});

module.exports = multer({ storage: storage }).single("image"); // On export notre objet storage et on dit que le fichier entrant doit être un seul fichier et de type image

