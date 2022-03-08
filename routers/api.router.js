const express = require("express");

const reviewsRouter = require("./reviews.router");
const categoriesRouter = require("./categories.router");
const commentsRouter = require("./comments.router");
const usersRouter = require("./users.router");
const endpoints = require("../endpoints.json");

const apiRouter = express.Router();

apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/users", usersRouter);

apiRouter.get("/", (req, res, next) => {
  res.send(endpoints);
});

module.exports = apiRouter;
