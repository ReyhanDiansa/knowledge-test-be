const express = require("express");
const fileController = require("../controllers/fileController");

const app = express();
app.use(express.json());

app.get("/:filename", fileController.getFile);

module.exports = app;
