// Cody recommended doing this
// Makes it so the .env file is read locally to get API key
// but on heroku if the NODE_ENV config var is set to production, app will look there
if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

// this is how to access the api key
console.log(process.env.TRAIL_API_KEY);

var express = require('express');
var morgan = require('morgan');
var path = require('path');
var userController = require('./controllers/userControllers.js')

var app = express();
app.use(morgan('dev'));

var port = process.env.PORT || 4000;

// Routes for user signin, signup, and signedin 
app.post('/signin', userController.signin);
app.post('/signup', userController.signup);
app.get('/signedin', userController.checkAuth);

// Serve up static assets 
app.use(express.static(path.join(__dirname, '../client')));


app.listen(port);