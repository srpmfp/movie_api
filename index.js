
const express = require('express'),
    morgan = require('morgan'),
    bodyParser = require('body-parser');

const mongoose = require('mongoose');
const models = require('./models.js');


const app = express();
const movie = models.movie;
const user = models.User;
const { check, validationResult } = require('express-validator');



// gathering static HTML pages from public


let cors = require('cors');
app.use(cors());
let auth = require('./auth')(app);
app.use(express.static('public'));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


const passport = require('passport');
require = ('./passport');



// logs entries into the terminal
app.use(morgan('common'));

//mongoose.connect('mongodb://localhost:27017/myMovie')
mongoose.connect(process.env.CONNECTION_URI)
///CREATE///

// adding user

app.post('/users', [
    // input validation
    check('Username', 'Username is required')
        .not().isEmpty(),
    check('Username', 'Username contains non-alphanumeric characters')
        .isAlphanumeric(),
    check('email', 'Email does not appear to be valid')
        .isEmail(),
    check('birthday', 'must be a date in yyyy-mm-dd format').isDate()
],
    async (req, res) => {
        let hashedPassword = user.hashPassword(req.body.Password);
        await user.findOne({ Username: req.body.Username }).then((nUser) => {

            // empty pw check
            if (!req.body.Password) {
                res.status(500).send('Error: Password cannot be empty')
            } else {
                if (nUser) {
                    //  username already exists
                    return res.status(400).send(`${req.body.name} already exists`);
                } else {
                    // create user
                    user.create({

                        Username: req.body.Username,
                        email: req.body.email,
                        Password: hashedPassword,
                        birthday: req.body.birthday,
                        movieId: []

                    }).then((user) => {

                        res.status(200).json(user);

                    }).catch((err) => {

                        res.status(500).send(`Error: ${err}`)
                    })
                };
            }
        })
    });

// add movie to userList

app.post('/users/:username/', [
    check('movieId', '').isAlphanumeric(),
    check('movieId').not().isEmpty()
], passport.authenticate('jwt', { session: false }), async (req, res) => {
    if (req.user.Username !== req.params.username) {
        console.log(req.user.Username);
        return res.status(400).send('Permission Denied');
    }

    await user.findOneAndUpdate({ Username: req.params.username }, {

        $push: {
            movieId: req.body.movieId
        }

    },
        { new: true })
        .then(userUpd => {
            return res.json(userUpd)
        }).catch(err => {
            res.status(500).send(`Error: ${err}`)
        })
});



app.post('/movies', [
    // title is not empty and alphanumeric 
    check(['title', 'Only include alphanumeric characters']).isAlphanumeric(),
    check(['title', 'Only include alphanumeric characters']).not().isEmpty(),
    // genere is not empty and alphanumeric
    check(['genre', 'Only include alphanumeric characters']).isAlphanumeric(),
    check(['genre', 'Only include alphanumeric characters']).not().isEmpty(),
    // director name, bio, 
    check(['director.name', 'Only include alphanumeric characters']).isAlphanumeric(),
    check(['director.bio', 'Only include alphanumeric characters']).isAlphanumeric(),
    check(['director.birthday', 'Only include alphanumeric characters']).isDate(),
    check(['director.death', 'Only include alphanumeric characters']).isDate()



], passport.authenticate('jwt', { session: false }), async (req, res) => {

    await user.findOne({ title: req.body.title }).then((nMovie) => {

        if (nMovie) {
            return res.status(400).send(`${req.body.name} already exists`);
        } else {
            movie.create({

                title: req.body.title,
                genre: req.body.email,
                director: {

                    name: req.body.director.name,
                    bio: req.body.director.bio,
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
    res.send('Welcome to Appflix Movie database\n Start by creating a new user or logging in');
});




// movies
app.get('/movies',
    // passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await movie.find().then(movie => {
            res.status(201).json(movie)
        }).catch(err => {
            res.status(500).send(`Error: ${err}`)
        })

    });


// movies by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
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

app.get('/movies/genre/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => {
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
app.get('/movies/director/:dirName', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { dirName } = req.params;
    await movie.find({ "director.name": dirName }).then((movies) => {

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

app.put('/users/:username', [check('Username', 'No Username Present').not().isEmpty()], passport.authenticate('jwt', { session: false }), async (req, res) => {
    if (req.user.Username !== req.params.username) {
        console.log(req.user.Username);
        return res.status(400).send('Permission Denied');
    }
    else {

        const updateUser = req.body;


        await user.findOneAndUpdate({ Username: req.params.username }, {



            $set: {

                Username: updateUser.Username,
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
    }
});



//DELETE



// delete User
app.delete('/users/:username/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if (req.user.Username !== req.params.username) {
        return res.status(400).send('Permission Denied')
    }

    await user.findOneAndDelete({ Username: req.params.username }).then(delUser => {
        if (delUser) {
            return res.status(204).send(`User ${delUser} has been removed`);
        } else {
            return res.status(404).send('User not found');
        }
    }).catch
        (err => {
            res.status(500).send(`Error: ${err}`)
        });
});


// remove movies from list
app.delete('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {

    await user.findOneAndUpdate({ Username: req.params.username }, {
        $pull: {
            movieId: req.params.movieId
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
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
    console.log(`listening on port ${port}`);
});

