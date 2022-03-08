const express = require("express");
const app = express();
const cors = require("cors");
const apiRouter = require("./routers/api.router");
const {
  handleNotFound,
  handlePsqlErrors,
  handleCustomErrors,
  handleServerErrors,
} = require("./errors/errors");

app.use(cors());

app.use(express.json());

app.use("/api", apiRouter);

app.all("*", handleNotFound);
app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
