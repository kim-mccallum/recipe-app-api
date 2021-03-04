const express = require("express");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const recipesControllers = require("../controllers/recipes-controllers");

const router = express.Router();

router.get("/:rid", recipesControllers.getRecipeById);

router.get("/user/:uid", recipesControllers.getRecipesByUserId);
//add protected routes after the above which are not protected
//middleware that checks for valid token
router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("ingredients").not().isEmpty(),
    check("instructions").not().isEmpty(),
  ],
  recipesControllers.createRecipe
);

router.patch(
  "/:rid",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("ingredients").isLength({ min: 5 }),
    check("instructions").isLength({ min: 5 }),
  ],
  recipesControllers.updateRecipe
);

router.delete("/:rid", recipesControllers.deleteRecipe);

module.exports = router;
