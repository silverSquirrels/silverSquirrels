var userControllers = require('./controllers/userControllers.js');
var trailController = require('./controllers/TrailController.js');
var geocodeController = require('./controllers/GeocodeController.js');

module.exports = function (app, express) {
  app.post('/signin', userControllers.signin);
  app.post('/signup', userControllers.signup);
  app.get('/signedin', userControllers.checkAuth);
  app.get('/getUser', userControllers.getUser);
  /// trailPost function in services.js updates the trails arrays with these endpoints:
  app.post('/hasDone', userControllers.hasDone);
  app.post('/wantToDo', userControllers.wantToDo);
  app.post('/moveTrails', userControllers.moveTrails);
  app.put('/friends/add', userControllers.addFriend);
  app.get('/friends/all', userControllers.getFriends);

  // Handle trailAPI requests:
  app.post('/api/trails', trailController.getTrails);
  // Handle geocode API requests
  app.post('/api/coords', geocodeController.getCoords);
  
  return app;
}
  