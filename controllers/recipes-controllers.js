const fs = require("fs");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const Recipe = require("../models/recipe");
const User = require("../models/user");

const getRecipeById = async (req, res, next) => {
  const recipeId = req.params.rid;
  let recipe;
  try {
    recipe = await Recipe.findById(recipeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find that recipe",
      500
    );
    return next(error);
  }

  if (!recipe) {
    // return to stop execution if there is an error
    throw new HttpError("Could not find a recipe for the provided id.", 404);
  }
  res.json({ recipe: recipe.toObject({ getters: true }) });
};

const getRecipesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  console.log(userId);

  let userWithRecipes;
  try {
    userWithRecipes = await User.findById(userId).populate("recipes");
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Fetching recipes for that user failed. Please try again later.",
      500
    );
    return next(error);
  }
  // Check results before sending response
  if (!userWithRecipes || userWithRecipes.recipes.length === 0) {
    return next(
      new HttpError("Could not find any recipes for the provided user id.", 404)
    );
  }

  res.json({
    recipes: userWithRecipes.recipes.map((r) => r.toObject({ getters: true })),
  });
};

const createRecipe = async (req, res, next) => {
  //look for errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  //use destructuring to get the fields out of the body
  const { title, description, ingredients, instructions, creator } = req.body;
  //UPDATE
  const createdRecipe = new Recipe({
    title,
    description,
    ingredients,
    instructions,
    image: req.file.path, //path on the server
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      "Creating recipe failed. Please try again.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for that id.", 404);
    return next(error);
  }
  console.log(user);

  try {
    //we need to do two things at once so we use a transaction in a session
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdRecipe.save({ session: sess }); //stored the place
    user.recipes.push(createdRecipe); //special mongoose push - grabs place id and adds to user
    await user.save({ session: sess });
    await sess.commitTransaction(); //save changes to DB - if any one fails, everything rolls back
  } catch (err) {
    console.log(err);
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
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
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
  //only let users edit their own recipes
  if (recipe.creator.toString() !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to edit this recipe.",
      401
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

const deleteRecipe = async (req, res, next) => {
  const recipeId = req.params.rid;

  let recipe;
  try {
    recipe = await Recipe.findById(recipeId).populate("creator"); //populate allows you to refer to data in another collection if they are connected
  } catch (err) {
    const error = new HttpError(
      "Something went wrong. Could not delete that recipe.",
      500
    );
    return next(error);
  }

  if (!recipe) {
    const error = new HttpError("Could not find that recipe.", 404);
    return next(error);
  }

  if (recipe.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this recipe.",
      401
    );
    return next(error);
  }

  const imagePath = recipe.image;

  try {
    // use a session and transaction
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await recipe.remove({ session: sess }); //remove recipe
    recipe.creator.recipes.pull(recipe); //pull also removes the id
    await recipe.creator.save({ session: sess });
    await sess.commitTransaction(); //save changes to DB
  } catch (err) {
    const error = new HttpError(
      "Something went wrong. Could not delete that recipe",
      500
    );
    return next(error);
  }

  fs.unlink(imagePath, (err) => {
    console.log(err); //delete file
  });

  res.status(200).json({ message: `Deleted recipe: ${recipeId}` });
};

exports.getRecipeById = getRecipeById;
exports.getRecipesByUserId = getRecipesByUserId;
exports.createRecipe = createRecipe;
exports.updateRecipe = updateRecipe;
exports.deleteRecipe = deleteRecipe;
