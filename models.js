const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, required: true },
  description: { type: String, required: true },
  director: {
    bio: String,
    name: String,
    birthday: Date,
    death: Date,
  },
  image: String,
});

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  email: { type: String, required: true },
  birthday: Date,
  movieId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let movies = mongoose.model('movies', movieSchema);
let User = mongoose.model('users', userSchema);

module.exports.movie = movies;
module.exports.User = User;
