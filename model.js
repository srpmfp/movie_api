const mongoose = require('mongoose');

let movieSchema = {
    title: { type: String, require: true },
    genre: { type: String, require: true },
    director: {
        bio: { type: String },
        name: { type: String },
        birthday: { type: Date },
        death: { type: Date }
    },
    image: { type: String }
}

let userSchema = {
    name: { type: String, require: true },
    email: { type: String, require: true },
    birthday: { type: Date },
    movieTitles: { type: String }
}

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);


module.exports.Movie = Movie;
module.exports.User = User;