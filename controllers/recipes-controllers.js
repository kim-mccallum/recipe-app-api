const { v4: uuidv4 } = require("uuid");
const HttpError = require("../models/http-error");

const DUMMY_RECIPES = [
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

const getRecipeByUserId = (req, res, next) => {
  const userId = req.params.uid;
  console.log(userId);
  const recipe = DUMMY_RECIPES.find((r) => {
    return r.creator === userId;
  });
  console.log(recipe);
  if (!recipe) {
    throw new HttpError(
      "Could not find a recipe for the provided user id.",
      404
    );
  }
  res.json({ recipe });
};

const createRecipe = (req, res, next) => {
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

exports.getRecipeById = getRecipeById;
exports.getRecipeByUserId = getRecipeByUserId;
exports.createRecipe = createRecipe;
