const express = require("express");
const bodyParser = require("body-parser");

const recipesRoutes = require("./routes/recipes-routes");

const app = express();

app.use("/api/recipes", recipesRoutes);

//error handling in express - adding error means that this function only triggers with an error
app.use((error, req, res, next) => {
  //you can only send one response
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured." });
});

app.listen(5000);
