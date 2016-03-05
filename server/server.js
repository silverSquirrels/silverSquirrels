var express = require('express');
var middleware = require('./middleware');

if (process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

var app = express();
var port = process.env.PORT || 4000;

app = middleware(app, express);

var server = app.listen(port, console.log.bind(console, 'listening on port' + port));

var io = require('./socket/create')(server);
