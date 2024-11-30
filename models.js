const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
    title: { type: String, require: true },
    genre: { type: String, require: true },
    director: {
        bio: String,
        name: String,
        birthday: Date,
        death: Date
    },
    image: String
})

let userSchema = mongoose.Schema({
    name: { type: String, require: true },
    email: { type: String, require: true },
    birthday: Date,
    movieTitles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
})

let movies = mongoose.model('movies', movieSchema);
let User = mongoose.model('user', userSchema);


module.exports.movie = movies;
module.exports.User = User;