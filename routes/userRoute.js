const express = require("express");
const userController = require("../controllers/userController");

const app = express();
app.use(express.json());

app.post("/login", userController.Login);
app.post(
  "/register",
  userController.Register
);

module.exports = app;