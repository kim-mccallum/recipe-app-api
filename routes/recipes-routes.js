const express = require("express");
const { check } = require("express-validator");
const recipesControllers = require("../controllers/recipes-controllers");

const router = express.Router();

router.get("/:rid", recipesControllers.getRecipeById);

router.get("/user/:uid", recipesControllers.getRecipesByUserId);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("ingredients").not().isEmpty(),
    check("instructions").not().isEmpty(),
  ],
  recipesControllers.createRecipe
);

router.patch("/:rid", recipesControllers.updateRecipe);

router.delete("/:rid", recipesControllers.deleteRecipe);

module.exports = router;
