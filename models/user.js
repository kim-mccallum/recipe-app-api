const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, //unique makes an index NOT validate unique
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true }, // don't store files in the DB
  places: { type: String, required: true }, //string for now but change later
});

userSchema.plugin(uniqueValidator); //ensures that the email is unique

module.exports = mongoose.model("User", userSchema);
