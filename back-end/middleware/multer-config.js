const multer = require("multer");

const MIME_TYPES = {
  // Création d'un dictionnaire d'objet contenant les 3 différents types de mimes types qu'on peut avoir depuis le front-end.
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  // Création d'une constante storage(objet de configuration) à passer à multer. Diskstorage pour dire qu'on va l'enregistrer sur le disque.
  destination: (req, file, callback) => {
    //1er element de notre objet de configuration (destination). Fonction destination indique à multer dans quel dossier enregistrer les fichiers. Prend 3 arguments la requête, le file et le callback.
    callback(null, "images"); // Dans le callback on passe en argument null pour dire qu'il n'y a pas eu derreur et en 2nd argupment le nom de dossier.
  },
  filename: (req, file, callback) => {
    // 2nd element de notre objet de configuration (filename) pour expliquer a multer quelle nom de fichier utiliser.
    const name = file.originalname.split(" ").join("_"); // On va génerer le nouveau nom pour le fichier. nom d'origine du fichier accès avec originalname. On enleve les white space par des underscore.
    const extension = MIME_TYPES[file.mimetype]; // Création de l'extension de fichier. MIME_TYPE: est l'élément de notre dictionnaire. qui doit correspondre au mime type envoyé par le front end : file.mimetype.
    callback(null, name + Date.now() + "." + extension); // On créer le filename en entier: son nom, time stamp, un point, l'extension du fichier.
  },
});

module.exports = multer({ storage: storage }).single("image");
