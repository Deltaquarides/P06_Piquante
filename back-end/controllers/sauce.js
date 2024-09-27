const Sauce = require("../models/sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce); //--Parser l'objet requête car il est envoyer sous la  forme de FORM-DATA et non JSON. On le transforme en objet JS.
  delete sauceObject._id; // supprimé l'id de l'objet car notre base de données va creer automatiqument un id.
  delete sauceObject._userId; //Supprimé userId car on ne fait pas confiance au client, il peut utiliser un autre userid. On va plutôt utiliser le userID qui vient du token d'authentification.
  const sauce = new Sauce({
    ...sauceObject, //L'opérateur spread ... est utilisé pour faire une copie de tous les éléments de req.body.
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`, // On génère l'URL par nou même. req.protocol=http.Ajout de '://'.red.get('host'= localgost:3000).image= répertoire image et le nom du fichier.
  });

  sauce
    .save()
    .then(() => {
      res.status(201).json({
        message: "Objet enregistré !",
      });
    })
    .catch((error) =>
      res.status(400).json({
        error,
      })
    );
};

exports.allSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) =>
      res.status(400).json({
        error,
      })
    );
};

exports.getOneSauce = (req, res, next) => {
  // On implémente une requête GET pour un seule objet avec la méthode findById.
  Sauce.findById({
    _id: req.params.id, // l'id de la sauce en vente doit être le même que le paramètre de requête passé à notre route.
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    }) // retourne la sauce s'il existe dans la base de donées.
    .catch((error) => {
      res.status(404).json({
        error,
      });
    });
};

exports.modifySauce = (req, res, next) => {
  let sauceObject = {};
  req.file
    ? (Sauce.findOne({ _id: req.params.id }).then((sauce) => {
        if (req.auth.userId !== sauce.userId) {
          res.status(403).json({ message: "Non autorisé!" });
        } else {
          const filename = sauce.imageUrl.split("/images/")[1];
          fs.unlinkSync(`images/${filename}`);
        }
      }),
      (sauceObject = {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }))
    : (sauceObject = {
        ...req.body,
      }); //sinon on récupère l'objet dans le corps de la requête.

  // 1er argument savoir quelle sauce on modifie, celui dont l'id est égal a l'id envoyé dans le paramètre de l'objet.
  //2ème argument la nouvelle version de la sauce, on utilise le spread opérator pour récupérer la sauce qui est dans le corps de la requête, en précisant que l'id correspond à celui des paramètres
  Sauce.updateOne(
    { _id: req.params.id },
    {
      ...sauceObject,
      _id: req.params.id,
    }
  )
    .then(() => {
      res.status(200).json({
        message: " sauce modifié",
      });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      if (req.auth.userId !== sauce.userId) {
        res.status(403).json({ message: "Non autorisé!" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() =>
              res.status(200).json({
                message: "sauce supprimé",
              })
            )
            .catch(() => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) =>
      res.status(500).json({
        error: error,
      })
    );
};
//-------------------------------Implémentation de la logique métier like(1) et dislike(-1) , unlike(0) et un-dislike(0) ---------------//

//Premier cas: si la valeur du like provenant de la requête du front-end est 1, ajouter le userID dans le tableau usersLiked et incrémenter de 1 le like.
exports.likeSauce = (req, res, next) => {
  if (req.body.like == 1) {
    Sauce.updateOne(
      {
        _id: req.params.id,
      },
      {
        $push: {
          usersLiked: req.body.userId,
        },
        $inc: {
          likes: +1,
        },
      }
    )
      .then(() =>
        res.status(200).json({
          message: "Sauce liké !",
        })
      )
      .catch((error) =>
        res.status(400).json({
          error,
        })
      );
  }

  //Deuxième  cas: si la valeur du dislike provenant de la requête du front-end est -1, ajouter le userID dans le tableau usersDisliked et incrémenter de 1 le dislike.
  if (req.body.like == -1) {
    Sauce.updateOne(
      {
        _id: req.params.id,
      },
      {
        $push: {
          usersDisliked: req.body.userId,
        },
        $inc: {
          dislikes: +1,
        },
      }
    )

      .then(() =>
        res.status(200).json({
          message: "Sauce disliké !",
        })
      )
      .catch((error) =>
        res.status(400).json({
          error,
        })
      );
  }
  //Troisième cas si le like de la requête est de 0, dans le like et le dislike.

  //Si la sauce n'est plus liké on enleve le userId du tableau userLiked de notre BD, et on décrémente le like.
  if (req.body.like == 0) {
    //1st if
    Sauce.findOne({
      _id: req.params.id,
    })
      .then((product) => {
        if (product.usersLiked.includes(req.body.userId)) {
          //second if
          Sauce.updateOne(
            {
              _id: req.params.id,
            },
            {
              $pull: {
                usersLiked: req.body.userId,
              },
              $inc: {
                likes: -1,
              },
            }
          ) //findone
            .then(() =>
              res.status(200).json({
                message: "Cette sauce n'est plus liké !",
              })
            )
            .catch((error) =>
              res.status(400).json({
                error,
              })
            );
        } //second if

        //Si la sauce n'est plus disliké on enleve le userId du tableau userDisliked de notre BD, et on décrémente le dislikes.
        if (product.usersDisliked.includes(req.body.userId)) {
          Sauce.updateOne(
            {
              _id: req.params.id,
            },
            {
              $pull: {
                usersDisliked: req.body.userId,
              },
              $inc: {
                dislikes: -1,
              },
            }
          )
            .then(() =>
              res.status(200).json({
                message: "Cette sauce n'est plus disliké!",
              })
            )
            .catch((error) =>
              res.status(400).json({
                error,
              })
            );
        }
      }) //then
      .catch((error) =>
        res.status(400).json({
          error,
        })
      );
  } //1st if
}; //fin

/// a refaire lien : https://github.com/Perceaurore/BenoitMagnan_6_23112020/blob/main/docs/backend/controllers/sauces.js
