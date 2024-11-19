
const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser');

const app = express();
const uuid = require("uuid");

// USERS ARRAY

let users = [
    {
        name: 'kyle murphy',
        email: 'kmurph@nunya.com',
        id: 1,
        movieTitle: []
    },
    {
        name: 'myles kurphy',
        email: 'mKurph@nunya.com',
        id: 2,
        movieTitle: ["the shinning"]

    }
]

// MOVIE ARRAY
let movies = [
    {
        rating: 1,
        title: 'Back to the Future',
        genre: 'Comedy',
        director:
        {
            name: 'Robert Zemeckis',
            birthday: 'May 15th 1952',
            death: 'Alive',
        }
        ,
        image: 'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/7c138730698845.562f39291400d.jpg'

    },
    {
        rating: 2,
        title: 'Good Will Hunting',
        genre: 'Drama',
        director:
        {
            name: 'Gus Van Sant',
            birthday: 'July 24th 1952',
            death: 'Alive',
        }
        ,
        image: 'https://image.tmdb.org/t/p/original/bABCBKYBK7A5G1x0FzoeoNfuj2.jpg'
    },
    {
        rating: 3,
        title: 'Mrs. Doubtfire',
        genre: 'Comedy',
        director:
        {
            name: 'Chris Columbus',
            birthday: 'September 10th 1958',
            death: '',
        }
        ,
        image: 'https://www.themoviedb.org/t/p/original/eRrIeSCSFdEKjJCJG6whklICM9N.jpg'
    },
    {
        rating: 4,
        title: 'Shawshank Redemption',
        genre: 'Drama',
        director:
        {
            name: 'Frank Darabont',
            birthday: 'January 28th 1959',
            death: 'Alive',
        }
        ,
        image: 'https://image.tmdb.org/t/p/original/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg'
    },
    {
        rating: 5,
        title: 'Spirited Away',
        genre: 'Anime',
        director:
        {
            name: 'Hayao Miyazaki',
            birthday: 'January 5th 1941',
            death: 'Alive',
        }
        ,
        image: 'https://image.tmdb.org/t/p/original/fJGWeVHGuLSWbGShaxICAUCzBE5.jpg'
    },
    {
        rating: 6,
        title: 'Lord of the Rings: Fellowship of the Ring',
        genre: 'Fantasy',
        director:
        {
            name: 'Peter Jackson',
            birthday: 'October 31st 1961',
            death: 'Alive',
        }
        ,
        image: 'https://th.bing.com/th/id/OIP.Fe-zd7pd7lKnwdBauA28UQHaLH?rs=1&pid=ImgDetMain'
    },
    {
        rating: 7,
        title: 'Gladiator',
        genre: 'Period',
        director:
        {
            name: 'Ridley Scott',
            birthday: 'November 30th 1937',
            death: 'Alive',
        }
        ,
        image: 'https://image.tmdb.org/t/p/original/mZpjmpXN6cyYiTOtTnigG4aa1bP.jpg'
    },
    {
        rating: 8,
        title: 'The Last Samurai',
        genre: 'Period',
        director:
        {
            name: 'Edward Zwick',
            birthday: 'October 8th 1952',
            death: 'Alive',
        }
        ,
        image: 'https://image.tmdb.org/t/p/original/tGI6kqOIDgTw4DhEhGhV542VGf3.jpg'
    },
    {
        rating: 9,
        title: 'Starwars Vi: Return of the Jedi',
        genre: 'Sci-fi',
        director:
        {
            name: 'Richard Marquand',
            birthday: 'September 22 1937',
            death: 'September 4 1987',
        }
        ,
        image: 'https://image.tmdb.org/t/p/original/ydjp1K13GrnbiX0yjd398BI9xaC.jpg'
    },
    {
        rating: 10,
        title: 'Princess Mononoke',
        genre: 'Anime',
        director:
        {
            name: 'Hayao Miyazaki',
            birthday: 'January 5th 1941',
            death: 'Alive',
        }
        ,
        image: 'https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781421565972/art-of-princess-mononoke-9781421565972_hr.jpg'
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




///CREATE///

// adding user

app.post('/users', (req, res) => {
    const newUser = req.body;

    if (!newUser.name) {
        return res.status(400).send(`please include your name`);
    } else {
        newUser.id = uuid.v4();
        users.push(newUser);
        // return res.status(201).send('New user added');
        return res.status(201).json(newUser);
    };

});

// adding movie
app.post('/movies', (req, res) => {
    let newMovie = req.body;
    if (!newMovie.title) {
        const message = "No title for movie"
        res.status(400).send(message);
    } else {
        movies.push(newMovie);
        res.status(201).send(newMovie)
    }
})

// adding favorite movies

app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if (!user) {
        res.status(400).send('user not found');
    } else {
        user.movieTitle.push(movieTitle)
        res.status(200).send(`${movieTitle} has been added to user ${id}'s movie list`)
    }
})

///READ///

// start page//
app.get('/', (req, res) => {
    res.send('Welcome to my movie database\n start by adding /movies to your request to see the JSON')
})


// users///

app.get('/users', (req, res) => {
    res.status(200).json(users);
});



// movies
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
});


// movies by title
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const results = movies.filter(movies => movies.title.toLowerCase() === title.toLowerCase());
    if (results) {
        return res.status(200).json(results)
    } else {
        return res.status(400).send('no such movie exists')
    }
});

// movies  by genre
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const results = movies.filter(movies => movies.genre.toLowerCase() === genreName.toLowerCase());
    if (results) {
        return res.status(200).json(results)
    } else {
        return res.status(400).send('no such genre')
    }
});


// movies by director
app.get('/movies/director/:dirName', (req, res) => {
    const { dirName } = req.params;
    const results = movies.find(movie => movie.director.name.toLowerCase() === dirName.toLowerCase()).director;

    if (results) {
        res.status(200).json(results);
    } else {
        res.status(400).send(`this director isn't in the database`)
    }


});

//UPDATE///

app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updateUser = req.body;
    let user = users.find(user => user.id == id);
    if (!user) {
        return res.status(400).send(`please use the right id`);
    } else {

        user.name = updateUser.name;
        return res.status(200).json(user);
    };

});

//DELETE

app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id);

    if (!user) {
        res.status(400).send('user not  found');
    } else {
        user.movieTitle = user.movieTitle.filter(title => title != movieTitle);
        res.status(200).send(`${movieTitle} has been removed to user ${id}'s movie list`);
    }

});

app.delete('/users/:id/', (req, res) => {
    const { id } = req.params;

    let user = users.find(user => user.id == id);

    if (user) {
        users = users.filter(user => user.id != id);
        res.status(200).send(`user ${id}, ${user.name}, has been removed`);

    } else {
        res.status(400).send('user not  found');

    }

})

//error handling
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send('Something Broke!!')
});

app.listen(8080, () => {
    console.log('You are connected and listening to port 8080');
});

