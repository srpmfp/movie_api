
const express = require('express'),
    fs = require('fs'),
    path = require('path'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override');

const app = express();

// test json
let movies = [
    {
        'rating': 1,
        'Movie': 'Back to the Future',
        'Genre': 'Comedy'
    },
    {
        'rating': 2,
        'Movie': 'Good Will Hunting',
        'Genre': 'Drama'
    },
    {
        'rating': 3,
        'Movie': 'Mrs. Doubtfire',
        'Genre': 'Comedy'
    },
    {
        'rating': 4,
        'Movie': 'Shawshank Redemption',
        'Genre': 'Drama'
    },
    {
        'rating': 5,
        'Movie': 'Spirited Away',
        'Genre': 'Anime'
    },
    {
        'rating': 6,
        'Movie': 'Lord of the Rings: Fellowship of the Ring',
        'Genre': 'Fantasy'
    },
    {
        'rating': 7,
        'Movie': 'Gladiator',
        'Genre': 'Period'
    },
    {
        'rating': 8,
        'Movie': 'The Last Samurai',
        'Genre': 'Period'
    },
    {
        'rating': 9,
        'Movie': 'Starwars Vi: Return of the Jedi',
        'Genre': 'Sci-fi'
    },
    {
        'rating': 10,
        'Movie': 'Princess Mononoke',
        'Genre': 'Anime'
    }
];

// gathering static HTML pages from public
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


// logs entries into the terminal
app.use(morgan('common'));

//  returns get method requests
app.get('/', (req, res) => {
    res.send('Welcome to my movie database')
})

app.get('/movies', (req, res) => {
    res.json(movies);
});

//error handling
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send('Something Broke!!')
});

app.listen(8080, () => {
    console.log('You are connected and listening to port 8080');
});

