const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const userRoute = require("./routes/userRoute");
const categoryRoute = require("./routes/categoryRoute");
const productRoute = require("./routes/productRoute");
const statisticRoute = require("./routes/statisticRoute");
const fileRoute = require("./routes/fileRoute");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const apiRouter = express.Router();
apiRouter.use(`/user`, userRoute);
apiRouter.use(`/category`, categoryRoute);
apiRouter.use(`/product`, productRoute);
apiRouter.use(`/statistic`, statisticRoute);
apiRouter.use(`/file`, fileRoute);

//grouped router
app.use(`/api/v1`, apiRouter);


mongoose.set("strictQuery", false);
mongoose
  .connect(`${process.env.MONGO_URI}`)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Node API is Running in port ${process.env.PORT}`);
    });
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(error);
  });