const express = require("express");
const statisticController = require("../controllers/statisticController");
const auth = require(`../middlewares/authMiddleware`);

const app = express();
app.use(express.json());

app.get("/get-count", auth.authVerify, statisticController.getCountData);


module.exports = app;
