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

var app = express();
app.use(morgan('dev'));

var port = process.env.PORT || 4000;



app.use(express.static(path.join(__dirname, '../client')));


app.listen(port);