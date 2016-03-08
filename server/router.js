var userControllers = require('./controllers/userControllers.js');
var geocodeController = require('./controllers/GeocodeController.js');
var commentControllers = require('./controllers/commentControllers.js');

module.exports = function (app, express) {
  app.post('/signin', userControllers.signin);
  app.post('/signup', userControllers.signup);
  app.get('/signedin', userControllers.checkAuth);
  app.get('/user/getUser', userControllers.getUser);
  /// trailPost function in services.js updates the trails arrays with these endpoints:
  app.put('/friends/add', userControllers.addFriend);
  app.get('/friends/all', userControllers.getFriends);

  app.put('/user/trails', userControllers.updateUserTrail);
  app.post('/user/trails', userControllers.addTrailToUserTrails);

  // Handle trailAPI requests:
  app.post('/api/trails', commentControllers.getTrails);
  // Handle geocode API requests
  app.post('/api/coords', geocodeController.getCoords);
  app.post('/comment', commentControllers.submit);
  app.get('/comments', commentControllers.getTrailComments);

  return app;
};
