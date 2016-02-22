// Cody recommended doing this
// Makes it so the .env file is read locally to get API key
// but on heroku if the NODE_ENV config var is set to production, app will look there
if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}
/// This is how to access the api key:
/// process.env.TRAIL_API_KEY

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var unirest = require('unirest');
var userController = require('./controllers/userControllers.js');

var app = express();
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', function(req, res){
  res.send('Hello world');
});

app.post('/api/coords', function(req, res){

  var radius = req.body.radius;
  var lat = req.body.lat;
  var long = req.body.long;
  var limit = 30;

  unirest.get("https://trailapi-trailapi.p.mashape.com/?lat="+lat+"&"+limit+"=20&lon="+long+"&q[activities_activity_type_name_eq]=hiking&radius="+radius)
    .header("X-Mashape-Key", process.env.TRAIL_API_KEY)
    .header("Accept", "text/plain")
  .end(function(result){
    var coordinates = result.body.places.map(function(el){
      return [el.lat, el.lon];
    });
    console.log('coordinates', coordinates);
    res.send(coordinates);
  });

});


// unirest.get("https://trailapi-trailapi.p.mashape.com/?lat=42&limit=20&lon=-87&q[activities_activity_type_name_eq]=hiking&radius=30")
// .header("X-Mashape-Key", "qblT0DCbM3msh34GG2Nv6BWzEdl9p1wJPKnjsn7pGKt7415nQZ")
// .header("Accept", "text/plain")
// .end(function (result) {
//   //console.log(result.status, result.headers, result.body);

//   result.body.places.forEach(function(element){
//     //console.log('=============',element)
//     console.log(element.name);
//     console.log(element.lat);
//     console.log(element.lon);
//   });
//   var coordinates = result.body.places.map(function(el){
//       return [el.lat, el.lon];
//     });
//   console.log(coordinates)
// });
// Routes for user signin, signup, and signedin 
app.post('/signin', userController.signin);
app.post('/signup', userController.signup);
app.get('/signedin', userController.checkAuth);

// Serve up static assets 
app.use(express.static(path.join(__dirname, '../client')));


app.listen(port);