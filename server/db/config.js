var mongoose = require('mongoose');

mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/hikexpertdb';

mongoose.connect(mongoURI);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection.error'));
db.once('open', function() {
  console.log("Mongoose connection open");
});

module.exports = db;