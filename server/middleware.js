var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var router = require('./router');
var db = require('./db/create');

module.exports = function (app, express) {
  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, '../client')));
  router(app, express);
  
  return app;
}
