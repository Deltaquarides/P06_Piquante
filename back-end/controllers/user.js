const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//require("dotenv").config();

const User = require("../models/user");

exports.signUp = (req, res, next) => {
  // Création d'un utilisateur.
  bcrypt
    .hash(req.body.password, 10) //On va hasher le MDP avec bcrypt ensuite enregistrer le user dans la base de donées. On va lui (fonction hash) passer le corps de la requête.On exécute 10 fois l'algorithme de hachage.
    .then((hash) => {
      // création d'un nouveau user avec le modèle User
      const user = new User({
        email: req.body.email, // Adresse mail passé dans le corps de la requête dans email.
        password: hash, // Mot de passe crypter dans password.
      });
      user
        .save() // Methode save pour enregistrer dans notre base de données.
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(409).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  // Vérifier si l'utilisateur existe dans notre base de donées et si le mot de passe transmit par le client correspond à cet utilisateur .
  User.findOne({ email: req.body.email }) // On utilise notre modèle Mongoose pour vérifier que l'e-mail entré par l'utilisateur correspond à un utilisateur existant de la base de données :
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ error: "Paire login/mot de passe incorrecte!" }); // Erreure si mail utilisateur non trouvé dans la base de données.
      }
      bcrypt
        .compare(req.body.password, user.password) // Utilisation de la fonction compare de bycrypt pour comparer le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données.
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ error: "Paire login/mot de passe incorrecte!" }); // Erreure s'ils ne correspondent pas.
          }
          res.status(200).json({
            // Si les informations d'identifications correspondent, on renvoie une réponse 200 contenant l'id de l'utilisateur ainsi qu'un TOKEN.
            userId: user._id,
            token: jwt.sign(
              // Appel de la fonction sign de jwt,pour chiffrer un token, qui prend 3 arguments.
              { userId: user._id }, // 1 arguments les donnees qu'on veux encoder (payload). L'identifiant ID du user pour être sur que cette requête correspond à l'user Id.
              process.env.RANDOM_TOKEN_SECRET, // 2 argument: clé secrete pour l'encodage.
              { expiresIn: "24h" } // 3 argument, argument de configuration, applique une expiration pour le Token.
            ),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error })); // Si erreure de la requête
};
