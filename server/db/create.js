var path = require('path');
var mongoose = require('mongoose');

if (process.env.NODE_ENV === 'production'){
  require('dotenv').config();
}
var mongoURI = process.env.MONGOLAB_URI;
mongoose.connect(mongoURI);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection.error'));
db.once('open', console.log.bind(console, 'Mongoose connection open'));
  
module.exports = db;
