const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator"); // Package pour MongoDB pour vérifier que e-mail est unique , marche mieux que " required: true";

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Meme si le MDP est crypté il est de type string
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("User", userSchema);
