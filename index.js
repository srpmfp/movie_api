const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser');

const mongoose = require('mongoose');
const models = require('./models.js');

const app = express();
const movie = models.movie;
const user = models.User;
const { check, validationResult } = require('express-validator');



app.use(express.static('public'));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

let cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');
require = './passport';

// logs entries into the terminal
app.use(morgan('common'));


// mongoose.connect('mongodb://localhost:27017/myMovie');
mongoose.connect(process.env.CONNECTION_URI);

/**Create a new user
 *  @module POST /users
 *  @description <h2><b>/users</b></h2><br>
 * <h4>Creates a new user with the provided username, email, password, and
 * birthday.</h4>
 *  @param {string} req.body.Username - The username of the user to be created.
 *  @param {string} req.body.email - The email address of the user to be
 * created.
 *  @param {string} req.body.Password - The password of the user to be created.
 *  @param {string} req.body.birthday - The birthday of the user to be created. Formatted as yyyy-mm-dd.
 *  @returns {Object} The created user object with hashed password.
 *  @throws {Error} If the username already exists or if there is an error during creation.
 */

app.post(
  '/users',
  [
    check('Username', 'Username is required').not().isEmpty(),
    check('Username', 'Username contains non-alphanumeric characters').isAlphanumeric(),
    check('email', 'Email does not appear to be valid').isEmail(),
    check('birthday', 'must be a date in yyyy-mm-dd format').isDate(),
  ],
  async (req, res) => {
    let hashedPassword = user.hashPassword(req.body.Password);
    await user.findOne({ Username: req.body.Username }).then((nUser) => {
      // empty pw check
      if (!req.body.Password) {
        res.status(500).send('Error: Password cannot be empty');
      } else {
        if (nUser) {
          //  username already exists
          return res.status(400).send(`${req.body.name} already exists`);
        } else {
          // create user
          user
            .create({
              Username: req.body.Username,
              email: req.body.email,
              Password: hashedPassword,
              birthday: req.body.birthday,
              movieId: [],
            })
            .then((user) => {
              res.status(200).json(user);
            })
            .catch((err) => {
              res.status(500).send(`Error: ${err}`);
            });
        }
      }
    });
  }
);



/**  create a new user
 * @module POST /users/:username
 * @param {string} users/:username/ - The username of the user to be created.
 * @description Creates a new user with the provided username, email, password, and birthday.
 * @return {Object} The created user object.
 * * @throws {Error} If the username already exists or if there is an error during creation.
 */
app.post(
  '/users/:username/',
  [check('movieId', '').isAlphanumeric(), check('movieId').not().isEmpty()],
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.username) {
      console.log(req.user.Username);
      return res.status(400).send('Permission Denied');
    }

    await user
      .findOneAndUpdate(
        { Username: req.params.username },
        {
          $push: {
            movieId: req.body.movieId,
          },
        },
        { new: true }
      )
      .then((userUpd) => {
        return res.json(userUpd);
      })
      .catch((err) => {
        res.status(500).send(`Error: ${err}`);
      });
  }
);

/**
 *  @module POST /movies
 *  @function createMovie
 *  @route /movies
 *  @description <p><h2> Creates a new movie from req.body details.</h2> <br>
 *  <i>All details must be alphanumeric and not empty.</i>
 * @param {string} req.body.title - <b>The title of the movie.</b>
 * @param {Object} req.body.genre -<b> The genre of the movie</b>.
 * @param {string} req.body.genre.genre - <b>The genre name.</b>
 * @param {string} req.body.genre.description - <b>The genre description.</b>
 * @param {string} req.body.description - <b>A brief description of the movie.</b>
 * @param {Object} req.body.director -<b> The director of the movie.</b>
 * @param {string} req.body.director.name - <b>The name of the director.</b>
 * @param {string} req.body.director.bio - <b>A brief biography of the director.</b>
 * @param {date} req.body.director.birthday - <b>The director's birthday in date format.</b>
 * @param {date} req.body.director.death - <b>The director's death date in date format.</b>
 * @param {string} req.body.image - <b>The URL of the movie's image.</b>
 *  @returns {Object} The created movie object.
 *  @throws {Error} If the movie already exists or if there is an error during creation.
 * 
 */
app.post(
  '/movies',
  [
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
    check(['director.death', 'Only include alphanumeric characters']).isDate(),
  ],
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await user.findOne({ title: req.body.title }).then((nMovie) => {
      if (nMovie) {
        return res.status(400).send(`${req.body.name} already exists`);
      } else {
        movie
          .create({


            title: req.body.title,
            genre:
            {
              genre: req.body.genre.genre,
              description: req.body.genre.description,
            },
            description: req.body.description,
            director: {
              name: req.body.director.name,
              bio: req.body.director.bio,
              birthday: req.body.director.birthday,
              death: req.body.director.death,
            },
            image: req.body.image,
          })
          .then((movie) => {
            res.status(200).json(movie);
          })
          .catch((err) => {
            res.status(500).throw(`Error: ${err}`);
          });
      }
    });
  }
);


app.get('/', (req, res) => {
  res.send('Welcome to Appflix Movie database\n Start by creating a new user or logging in');
});

app.get('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { username } = req.params;
  await user

    .find({ Username: username })

    .then((user) => {
      if (req.user.Username !== req.params.username) {
        return res.status(400).send('Unauthorized access');
      } else {
        if (user.length === 0) {
          return res.status(404).send('User not found');
        }
        res.status(201).json(user);
      }
    })
    .catch((err) => {
      res.status(500).send(`Error: ${err}`);
    });
})

/**  #GET all movies
 *
 * @name GetMovies 
 * @module GET /movies
 * @description <h2><b>/movies</b></h2><br>
 * <h4>See <a href="#genreName">genreName</a> to get by genre.</h4>
 * <h3> <b>Returns a list of all movies in the database.</b><br>
 * <i>Requires authentication with JWT.</i></h3>
 * @route /movies
 * 
 * @returns {Array} An array of movie objects.
 * @example
 * // Example request:
 * GET /movies
 * headers: {
 *   content-type: application/json,
 *   Authorization: Bearer <token>
 * }
 * // Example response:
 * [
 *   {  
 *     title: 'Inception',
 *   genre: { 
 *      genre: 'Sci-Fi', 
 *      description: 'Thriller movies are a genre of film designed to provoke excitement, suspense, tension, and anxiety in the audience. 
 *      They often revolve around high-stakes situations, unexpected twists, and characters facing danger or moral dilemmas. 
 *    },
 *      description: 'A mind-bending thriller' ,
 *    director: { name: 'Christopher Nolan', 
 *      bio: 'British-American film director', 
 *      birthday: '1970-07-30', 
 *      death: null },
 *    image: 'https://example.com/inception.jpg'
 *  },
 *  {
 *    title: 'The Dark Knight',
 *    genre: { 
 *      genre: 'Action', 
 *      description: 'Action movies are fast-paced films that emphasize physical feats, intense fight scenes, and explosive sequences. 
 * They often feature heroes overcoming overwhelming odds through strength, skill, and determination.' 
 *    },
 *   description: 'A thrilling superhero movie',
 *    director: { 
 *      name: 'Christopher Nolan', 
 *      bio: 'British-American film director', 
 *      birthday: '1970-07-30', 
 *      death: null 
 *    },
 *    image: 'https://example.com/dark-knight.jpg'
 *  }
 * ]
 * @throws {Error} If there is an error retrieving the movies.
 */


app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await movie
    .find()
    .then((movie) => {
      res.status(201).json(movie);
    })
    .catch((err) => {
      res.status(500).send(`Error: ${err}`);
    });
});


/**
 * Get movie by title
 * @module GET /movies/:title
 * @route /movies/:title
 * @description  <h2>/movies/:title</h2><h3><br> Returns a movie that matches the specified title.<h3>
 * @param {string} title - The title of the movie to retrieve.
 * @returns {Object} The movie object that matches the specified title.
 * @example
 * // Example request:
 * GET /movies/Inception
 * // Example response:
 * {    title: 'Inception',
 *   genre: {
 *     genre: 'Sci-Fi',
 *    description: 'Thriller movies are a genre of film designed to provoke excitement, suspense, tension, and anxiety in the audience. 
 *    They often revolve around high-stakes situations, unexpected twists, and characters facing danger or moral dilemmas.'
 *  },
 * description: 'A mind-bending thriller',
 *  director: {
 *    name: 'Christopher Nolan',
 *    bio: 'British-American film director',
 *    birthday: '1970-07-30',
 *    death: null
 *  },
 *  image: 'https://example.com/inception.jpg'
 * }
 * 
 * @throws {Error} If there is an error retrieving the movie or if no movie with the specified title exists.
 */
// movies by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await movie
    .find({ title: req.params.title })
    .then((movie) => {
      if (movie) {
        return res.status(201).json(movie);
      } else {
        return res.status(400).send('no such movie exists');
      }
    })
    .catch((err) => {
      /**@return {Error} If there is an error retrieving the movie. */
      res.status(500).send(`Error: ${err}`);
    });
});
/**
 * * Get movies by genre name
 *  @module GET /movies/genre/:genreName
 * @route /movies/genre/:genreName
 * @description <a href="#genreName">Returns a list of movies that belong to the specified genre.</a>
 *  @route GET /movies/genre/:genreName
 *  @description Returns a list of movies that belong to the specified genre.
 *  @param {string} genreName - The name of the genre to filter movies by.
 *  @example
 * // Example request:
 * GET /movies/genre/Sci-Fi
 * // Example response:
 * [
 *   {
 *     Genre: 'Sci-Fi',
 *     description: 'Sci-Fi movies are a genre of speculative fiction that explores imaginative and futuristic concepts, often involving advanced technology, space exploration, time travel, and extraterrestrial life.'
 *   }
 * ]
 * @returns {Array} An array of movies that match the specified genre.
 */

app.get(
  '/movies/genre/:genreName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { genreName } = req.params;
    await movie
      .find({ genre: genreName })
      .then((genre) => {
        if (genre) {
          return res.status(201).json(genre);
        } else {
          return res.status(400).send('no such movie exists');
        }
      })
      .catch((err) => {
        res.status(500).send(`Error: ${err}`);
      });
  }
);

/**
 * Get movies by director name
 *  @module GET /movies/director/:dirName
 *  @description <h2><b>/movies/director/:dirName</b></h2><br>
 *  <h4>Returns a list of movies directed by the specified director.</h4>
 *  @route GET /movies/director/:dirName
 *  @description Returns a list of movies directed by the specified director.
 *  @param {string} dirName - The name of the director to filter movies by.
 *  @returns {Array} An array of information about a director, their birthday, death date, and bio.
 */
app.get(
  '/movies/director/:dirName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { dirName } = req.params;
    await movie
      .find({ 'director.name': dirName })
      .then((movies) => {
        // finds movies with directors name
        if (movies.length > 0) {
          const directors = movies.map((movie) => movie.director); // maps specific info to new variable
          return res.status(201).json(directors);
        } else {
          return res.status(400).send('no director by name in list');
        }
      })
      .catch((err) => {
        return res.status(500).send('Error: ' + err);
      });
  }
);


/**Update user information
 * @module PUT /users/:username
 * @route PUT /users/:username
 * @description <h2><b>/users/:username</b></h2><br>
 * <h4>Updates the user information for the specified username.</h4>
 * @param {string} username - The username of the user to be updated.
 * @param {Object} req.body - The updated user information.
 * @param {string} req.body.Username - The new username for the user.
 * @param {string} req.body.email - The new email address for the user.
 * @param {date} req.body.birthday - The new birthday for the user in date format.
 * @param {string} req.body.Password - The new password for the user.
 * @returns {Object} The updated user object. Password is hashed before saving.
 *   
 * <h4>Request Body:</h4>
 * <pre>
 * {
 *   "Username": "newusername",
 *   "email": "newemail@example.com",
 *   "birthday": "1990-01-01",
 *   "Password": "newpassword"
 * }
 * </pre>
 */

app.put(


  '/users/:username',
  [check('Username', 'No Username Present').not().isEmpty()],
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.username) {
      console.log(req.user.Username);
      return res.status(400).send('Permission Denied');
    } else {
      const updateUser = req.body;

      // Only hash password if it's provided and not empty
      let updateFields = {
        Username: updateUser.Username,
        email: updateUser.email,
        birthday: updateUser.birthday,
      };

      if (updateUser.Password && updateUser.Password.trim() !== '') {
        updateFields.Password = user.hashPassword(updateUser.Password);
      }

      await user
        .findOneAndUpdate(
          { Username: req.params.username },
          { $set: updateFields },
          { new: true }
        )
        .then((updatedUser) => {
          return res.status(200).json(updatedUser);
        })
        .catch((err) => {
          res.status(500).send(`Error: ${err}`);
        });
    }
  }
);

/**
 * Delete user
 * @module DELETE /users/:username
 * @route DELETE /users/:username
 * @description Deletes a user from the database.
 * @param {string} username - The username of the user to be deleted.
  * @returns {string} A message indicating that the user has been removed.
  * @throws {Error} If the user does not exist or if there is an error during deletion.
  *  @example
  * // Example request:
  * DELETE /users/johndoe
  * // Example response:
  * User johndoe has been removed
 */

// delete User
app.delete(
  '/users/:username/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    if (req.user.Username !== req.params.username) {
      return res.status(400).send('Permission Denied');
    }

    await user
      .findOneAndDelete({ Username: req.params.username })
      .then((delUser) => {
        if (delUser) {
          return res.status(204).send(`User ${delUser} has been removed`);
        } else {
          return res.status(404).send('User not found');
        }
      })
      .catch((err) => {
        res.status(500).send(`Error: ${err}`);
      });
  }
);

/**
 * 
 * Delete movie from user list
 * @module DELETE /users/:username/movies/:movieId
 * @description Removes a movie from the user's list of favorite movies.
 * @route DELETE /users/:username/movies/:movieId
 * @param {string} username - The username of the user whose movie list is being updated.
 * @param {string} movieId - The ID of the movie to be removed from the user's list.
 *  @returns {Object} The updated user object after removing the movie.
 *  @throws {Error} If there is an error during the update or if the user does not exist.
 *  @example
 * // Example request:
 * DELETE /users/johndoe/movies/12345
 * // Example response:
 *  "Username": "johndoe"
 * {
 *   "movieId": "12345",

 * }
 * @returns 
 *  This endpoint allows users to remove a movie from their list of favorite movies.
 *
 * 
 */
app.delete(
  '/users/:username/movies/:movieId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await user
      .findOneAndUpdate(
        { Username: req.params.username },
        {
          $pull: {
            movieId: req.params.movieId,
          },
        },
        { new: true }
      )
      .then((delMov) => {
        return res.json(delMov);
      })
      .catch((err) => {
        res.status(500).send(`Error: ${err}`);
      });
  }
);

/**
 * Error handling middleware
 * @module ErrorHandler
 * @description Middleware for handling errors in the application.
 * This middleware catches errors that occur during the request processing and sends a response with a 500 status code.
 *  It logs the error stack to the console for debugging purposes.
 * @param {Error} err - The error object
 */

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send(`Error: ${err}`);
});
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`listening on port ${port}`);
});
