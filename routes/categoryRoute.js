const express = require("express");
const categoryController = require("../controllers/categoryController");
const auth = require(`../middlewares/authMiddleware`);

const app = express();
app.use(express.json());


app.post(
  "/",
  auth.authVerify,
  categoryController.addCategory
);
app.delete(
  "/:id",
  auth.authVerify,
  categoryController.deleteCategory
);

//with pagination
app.get("/", auth.authVerify, categoryController.getCategory);

app.put(
  "/:id",
  auth.authVerify,
  categoryController.updateCategory
);
app.get("/find/:id", auth.authVerify, categoryController.findCategory);

//without pagination
app.get("/find-all", auth.authVerify, categoryController.findAll);

module.exports = app;
