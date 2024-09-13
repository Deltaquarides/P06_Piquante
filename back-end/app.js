const express = require("express");
const mongoose = require("mongoose");

const app = express();
const userRoutes = require("./routes/user");
const sauceRoutes = require("./routes/sauce");
const likeRoutes = require("./routes/sauce");

const path = require("path");

require("dotenv").config();
//console.log(process.env)

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use("/api/auth", userRoutes);
app.use("/api/sauces", sauceRoutes);

app.use("/api/sauces", likeRoutes);

app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
