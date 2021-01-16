const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const Recipe = require("../models/recipe");

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

const getRecipesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let recipes;
  try {
    recipes = await Recipe.find({ creator: userId }); //mongoose returns array but MongoDB would return cursor
  } catch (err) {
    const error = new HttpError(
      "Fetching recipes for that user failed. Please try again later.",
      500
    );
    return next(error);
  }
  // Check results before sending response
  if (!recipes || recipes.length === 0) {
    return next(
      new HttpError("Could not find any recipes for the provided user id.", 404)
    );
  }

  res.json({ recipes: recipes.map((r) => r.toObject({ getters: true })) });
};

const createRecipe = async (req, res, next) => {
  //look for errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }

  //use destructuring to get the fields out of the body
  const { title, description, ingredients, instructions, creator } = req.body;
  //UPDATE
  const createdRecipe = new Recipe({
    title,
    description,
    ingredients,
    instructions,
    image:
      "https://www.chelanfresh.com/wp-content/uploads/2019/08/Lucy-Glo_NEW1.png", //hardcoded for now until we add file upload
    creator,
  });

  try {
    await createdRecipe.save();
  } catch (err) {
    const error = new HttpError(
      "Creating recipe failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ recipe: createdRecipe }); //201 is successfully created
};

const updateRecipe = async (req, res, next) => {
  //look for errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs passed, please check your data.", 422);
  }
  //extract the id
  const recipeId = req.params.rid;
  // get the new parameters
  const { title, description, ingredients, instructions } = req.body;

  let recipe;
  try {
    recipe = await Recipe.findById(recipeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update recipe",
      500
    );
    return next(error);
  }
  recipe.title = title;
  recipe.description = description;
  recipe.ingredients = ingredients;
  recipe.instructions = instructions;
  //Store the data in the DB
  try {
    await recipe.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update recipe.",
      500
    );
    return next(error);
  }
  // return the response
  res.status(200).json({ recipe: recipe.toObject({ getters: true }) });
};

const deleteRecipe = (req, res, next) => {
  const recipeId = req.params.rid;
  if (!DUMMY_RECIPES.find((r) => r.id === recipeId)) {
    throw new HttpError("Could not find that id.", 404);
  }
  DUMMY_RECIPES = DUMMY_RECIPES.filter((r) => r.id !== recipeId);
  res.status(200).json({ message: `Deleted recipe: ${recipeId}` });
};

exports.getRecipeById = getRecipeById;
exports.getRecipesByUserId = getRecipesByUserId;
exports.createRecipe = createRecipe;
exports.updateRecipe = updateRecipe;
exports.deleteRecipe = deleteRecipe;
