
const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser');

const mongoose = require('mongoose');
const models = require('./models.js');


const app = express();
const movie = models.movie;
const user = models.User;



// gathering static HTML pages from public
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


// logs entries into the terminal
app.use(morgan('common'));

mongoose.connect('mongodb://localhost:27017/myMovie')

///CREATE///

// adding user

app.post('/users', async (req, res) => {
    // const newUser = req.body;
    await user.findOne({ name: req.body.name }).then((nUser) => {
        if (nUser) {
            return res.status(400).send(`${req.body.name} already exists`);
        } else {
            user.create({
                name: req.body.name,
                email: req.body.email,
                birthday: req.body.birthday,
                movieTitles: req.body.MovieTitles
            }).then((user) => {
                res.status(200).json(user);
            }).catch((err) => {
                res.status(500).throw(`Error: ${err}`)
            })
        };
    })
});

// add movie to userList

app.post('/users/:id/movies/:movieId', async (req, res) => {

    await user.findByIdAndUpdate({ _id: req.params.id }, {
        $push: {
            movieTitles: req.params.movieId
        }
    },
        { new: true }).then(userUpd => {
            return res.json(userUpd)
        }).catch(err => {
            res.status(500).send(`Error: ${err}`)
        })
});



app.post('/movies', async (req, res) => {

    // const newUser = req.body;
    await user.findOne({ title: req.body.title }).then((nMovie) => {

        if (nMovie) {
            return res.status(400).send(`${req.body.name} already exists`);
        } else {
            movie.create({
                title: req.body.title,
                genre: req.body.email,
                director: {
                    bio: req.body.director.bio,
                    name: req.body.director.name,
                    birthday: req.body.director.birthday,
                    death: req.body.director.death
                },
                image: req.body.image
            }).then((movie) => {
                res.status(200).json(movie);
            }).catch((err) => {
                res.status(500).throw(`Error: ${err}`)
            })
        };
    })
});


///READ///

// start page//
app.get('/', (req, res) => {
    res.send('Welcome to my movie database\n start by adding /movies to your request to see the JSON')
}).catch(err => {
    res.status(500).send(`Error: ${err}`)
});



// movies by title
app.get('/movies/:title', async (req, res) => {
    await movie.find({ title: req.params.title }).then((movie) => {

        if (movie) {
            return res.status(201).json(movie);
        }
        else {
            return res.status(400).send('no such movie exists');
        }
    }).catch(err => {
        res.status(500).send(`Error: ${err}`)
    })
});
// movies  by genre

app.get('/movies/genre/:genreName', async (req, res) => {
    const { genreName } = req.params;
    await movie.find({ genre: genreName }).then((genre) => {

        if (genre) {
            return res.status(201).json(genre);
        }
        else {
            return res.status(400).send('no such movie exists');
        }
    }).catch(err => {
        res.status(500).send(`Error: ${err}`)
    })
});




// movies by director
app.get('/movies/director/:dirName', async (req, res) => {
    const { dirName } = req.params;
    await movie.findOne({ "director.name": dirName }).then((movies) => {

        // finds movies with directors name
        if (movies.length > 0) {
            const directors = movies.map(movie => movie.director) // maps specific info to new variable
            return res.status(201).json(
                directors);
        }
        else {
            return res.status(400).send('no director by name in list');
        }
    }).catch(err => {
        return res.status(500).send('Error: ' + err)

    })
});


//UPDATE///

app.put('/users/:id', async (req, res) => {

    const { id } = req.params;
    const updateUser = req.body;
    await user.findOneAndUpdate({ _id: id }, {



        $set: {

            name: updateUser.name,
            email: updateUser.email,
            birthday: updateUser.birthday,

        }

    },
        { new: true }
    ).then(updatedUser => {
        return res.status(200).json(updatedUser)
    }).catch(err => {
        res.status(500).send(`Error: ${err}`)
    })
});

//DELETE




app.delete('/users/:id/', async (req, res) => {
    const { id } = req.params;
    await user.findByIdAndDelete({ _id: id }).then(delUser => {
        if (delUser) {
            return res.status(204).send(`User ${id} has been removed`);
        } else {
            return res.status(404).send('User not found');
        }
    }).catch
        (err => {
            res.status(500).send(`Error: ${err}`)
        });
});

// remove movies from list
app.delete('/users/:id/movies/:movieId', async (req, res) => {

    await user.findByIdAndUpdate({ _id: req.params.id }, {
        $pull: {
            movieTitles: req.params.movieId
        }
    },
        { new: true }).then(userUpd => {
            return res.json(userUpd)
        }).catch(err => {
            res.status(500).send(`Error: ${err}`)
        })
})


//error handling
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send(`Error: ${err}`)
});

app.listen(8080, () => {
    console.log('You are connected and listening to port 8080');
});

