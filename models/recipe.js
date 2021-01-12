const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  ingredients: { type: String, required: true },
  instructions: { type: String, required: true },
  creator: { type: String, required: true },
});

module.exports = mongoose.model("Recipe", recipeSchema);
