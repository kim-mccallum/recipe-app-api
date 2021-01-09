const express = require("express");
const recipesControllers = require("../controllers/recipes-controllers");

const router = express.Router();

router.get("/:rid", recipesControllers.getRecipeById);

router.get("/user/:uid", recipesControllers.getRecipesByUserId);

router.post("/", recipesControllers.createRecipe);

router.patch("/:rid", recipesControllers.updateRecipe);

router.delete("/:rid", recipesControllers.deleteRecipe);

module.exports = router;
