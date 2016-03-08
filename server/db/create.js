var path = require('path');
var mongoose = require('mongoose');

var mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost/hikexpertdb';
mongoose.connect(mongoURI);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongoose connection error: '));
db.once('open', console.log.bind(console, 'Mongoose connection open: ' + mongoURI));

module.exports = db;
