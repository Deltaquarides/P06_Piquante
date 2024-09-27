const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // On doit récuperer le token. enlever la parti bearer avec split.
    const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_KEY); // appel de la méthode vérify qui permet de vérifier la validité d'un token. En lui passant le token récuperer et la clé secrète.
    const userId = decodedToken.userId; // Dans le token récupérer la propriété userId.
    req.auth = {
      // Nous extrayons l'ID utilisateur de notre token et le rajoutons à l’objet Request afin que nos différentes routes puissent l’exploiter.
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
