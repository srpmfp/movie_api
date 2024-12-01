const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
    title: { type: String, required: true },
    genre: { type: String, required: true },
    director: {
        bio: String,
        name: String,
        birthday: Date,
        death: Date
    },
    image: String
})

let userSchema = mongoose.Schema({
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    email: { type: String, required: true },
    birthday: Date,
    movieTitles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
})

let movies = mongoose.model('movies', movieSchema);
let User = mongoose.model('user', userSchema);


module.exports.movie = movies;
module.exports.User = User;