 // Cody recommended doing this
// Makes it so the .env file is read locally to get API key
// but on heroku if the NODE_ENV config var is set to production, app will look there

/// This is how to access the api key:
/// process.env.TRAIL_API_KEY

/// You will need to make a .env file with a TrailAPI key
/// (the .env files just needs one line: TRAIL_API_KEY: your_key_here)
/// the 'dotenv' module loads it from there, unless you are on Heroku, where you set it to an environment variable and set NODE_ENV to be 'production'
if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var unirest = require('unirest');
var userControllers = require('./controllers/userControllers.js');

var app = express();

// create and connect to database
var mongoose = require('mongoose');

var mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost/hikexpertdb';
console.log(mongoURI);
mongoose.connect(mongoURI);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection.error'));
db.once('open', function() {
  console.log("Mongoose connection open");
});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, '../client')));

app.post('/signin', userControllers.signin);
app.post('/signup', userControllers.signup);
app.get('/signedin', userControllers.checkAuth);
app.get('/getUser', userControllers.getUser);
app.post('/hasDone', userControllers.hasDone);
app.post('/wantToDo', userControllers.wantToDo);
app.post('/moveTrails', userControllers.moveTrails);

// Handle trailAPI requests:
app.post('/api/coords', function(req, res){
  var radius = req.body.radius;
  var lat = req.body.lat;
  var long = req.body.long;
  var limit = 30;

// Unirest is used to get API data, following example on trailAPI website
  unirest.get("https://trailapi-trailapi.p.mashape.com/?lat="+lat+"&"+limit+"=20&lon="+long+"&q[activities_activity_type_name_eq]=hiking&radius="+radius)
    .header("X-Mashape-Key", process.env.TRAIL_API_KEY)
    .header("Accept", "text/plain")
  .end(function(result){
    if(result.body.places){
      var coordinates = result.body.places.map(function(el){
        // Organize data into an object with name and coordinates properties:
        return {
          name: el.name,
          coordinates: [el.lat, el.lon]
        };
      });
      console.log('coordinates', coordinates);
      res.send(coordinates);
    } else {
      res.sendStatus(404);
    }
  });
});

exports.port = port;

app.listen(port);