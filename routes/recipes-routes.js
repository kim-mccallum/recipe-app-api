const express = require("express");
const recipesControllers = require("../controllers/recipes-controllers");

const router = express.Router();

router.get("/:rid", recipesControllers.getRecipeById);

router.get("/user/:uid", recipesControllers.getRecipeByUserId);

router.post("/", recipesControllers.createRecipe);

module.exports = router;
