
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
        'key': 'value',
        'key2': 'value2'
    }
];



// logs entries into the log.txt
const accessLogstream = fs.createWriteStream(path.join(__dirname, 'log.txt'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogstream }));

//  returns get method requests
app.get('/', (req, res) => {
    res.send('Welcome to my movie database')
})

app.get('/movies', (req, res) => {
    res.json(movies);
});


// gathering static HTML pages from public
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(bodyParser.json());
app.use(methodOverride());

//error handling
app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send('Something Broke!!')
});

app.listen(8080, () => {
    console.log('You are connected and listening to port 8080');
});

