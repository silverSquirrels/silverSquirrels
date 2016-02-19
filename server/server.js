var express = require('express');
var morgan = require('morgan');
var path = require('path');

var app = express();
app.use(morgan('dev'));

var port = process.env.PORT || 4000;



app.use(express.static(path.join(__dirname, '../client')));


app.listen(port);