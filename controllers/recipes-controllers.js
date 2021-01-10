const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");

let DUMMY_RECIPES = [
  {
    id: "r1",
    title: "Apple with almond butter",
    description: "Perfect, filling snack on the go!",
    imageUrl:
      "https://www.chelanfresh.com/wp-content/uploads/2019/08/Lucy-Glo_NEW1.png",
    ingredients:
      "Apple (pink lady, honey crisp or Lucy Glo), 2 Tablespoons of almond butter",
    instructions:
      "Slice the apple (optional), smear almond butter on it and eat it!",
    creator: "u1",
  },
  {
    id: "r2",
    title: "Avocado Toast",
    description:
      "Quick filling snack with whole grain bread and rich, delicious avocado!",
    imageUrl:
      "https://fsi.colostate.edu/wp-content/uploads/2016/02/Coveravocado.jpg",
    ingredients:
      "2 slices of sprouted whole grain bread, 0.5 ripe avocado, 1 tablespoon nutritional yeast.",
    instructions:
      "Toast the bread. Slice the avocado in the skin, scoop it out with a fork and smash it onto the bread. Sprinkle with nutritional yeast and serve.",
    creator: "u2",
  },
];
const getRecipeById = (req, res, next) => {
  const recipeId = req.params.rid;
  const recipe = DUMMY_RECIPES.find((r) => {
    return r.id === recipeId;
  });

  if (!recipe) {
    // return to stop execution if there is an error
    throw new HttpError("Could not find a recipe for the provided id.", 404);
  }
  res.json({ recipe });
};

const getRecipesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  console.log(userId);
  const recipes = DUMMY_RECIPES.filter((r) => {
    return r.creator === userId;
  });
  console.log(recipes);
  if (!recipes || recipes.length === 0) {
    throw new HttpError(
      "Could not find any recipes for the provided user id.",
      404
    );
  }
  res.json({ recipes });
};

const createRecipe = (req, res, next) => {
  //look for errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }

  //use destructuring to get the fields out of the body
  const { title, description, ingredients, instructions, creator } = req.body;
  const createdRecipe = {
    id: uuidv4(),
    title,
    description,
    ingredients,
    instructions,
    creator,
  };
  DUMMY_RECIPES.push(createdRecipe);

  res.status(201).json({ recipe: createdRecipe }); //201 is successfully created
};

const updateRecipe = (req, res, next) => {
  const { title, description, ingredients, instructions } = req.body;
  const recipeId = req.params.rid;
  const updatedRecipe = { ...DUMMY_RECIPES.find((r) => r.id === recipeId) };
  const recipeIndex = DUMMY_RECIPES.findIndex((r) => r.id === recipeId);
  updatedRecipe.title = title;
  updatedRecipe.description = description;
  updatedRecipe.ingredients = ingredients;
  updatedRecipe.instructions = instructions;
  DUMMY_RECIPES[recipeIndex] = updatedRecipe;
  //response
  res.status(200).json({ recipe: updatedRecipe });
};

const deleteRecipe = (req, res, next) => {
  const recipeId = req.params.rid;
  DUMMY_RECIPES = DUMMY_RECIPES.filter((r) => r.id !== recipeId);
  res.status(200).json({ message: `Deleted recipe: ${recipeId}` });
};

exports.getRecipeById = getRecipeById;
exports.getRecipesByUserId = getRecipesByUserId;
exports.createRecipe = createRecipe;
exports.updateRecipe = updateRecipe;
exports.deleteRecipe = deleteRecipe;
