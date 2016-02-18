var express = require('express');
var morgan = require('morgan');

var app = express();
app.use(morgan('dev'));

var port = process.env.PORT || 4000;

app.get('/', function(req, res){
  res.send('Hello world');
})


app.listen(port);