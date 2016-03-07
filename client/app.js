angular.module('hikexpert', [
  'hikexpert.home',
  'hikexpert.auth',
  'hikexpert.user',
  'hikexpert.chat',
  'hikexpert.trail',
  'ngRoute',
  'home.services',
  'trail.services',
  'auth.services',
  'friend.services',
  'socket.services',
  'map.services',
])
.config(function($routeProvider, $httpProvider){
  $routeProvider
    .when('/', {
      authenticate: true,
      templateUrl: 'homePage/homepage.html',
      controller: 'HomePageController'
    })
    .when('/trail', {
      authenticate: true,
      templateUrl: 'trail/trail.html',
      controller: 'TrailController'
    })
    .when('/user', {
      authenticate: true,
      templateUrl: 'user/user.html',
      controller: 'UserController'
    })
    .when('/friends', {
      authenticate: true,
      templateUrl: 'user/friends.html',
      controller: 'UserController'
    })
    .when('/chat', {
      authenticate: true,
      templateUrl: 'chat/chat.html',
      controller: 'ChatController'
    })
    .when('/signin', {
      templateUrl: 'auth/signin.html',
      controller: 'AuthController'
    })
    .when('/signup', {
      templateUrl: 'auth/signup.html',
      controller: 'AuthController'
    })
    .when('/aboutTeam', {
      templateUrl: 'about/aboutTeam.html'
    });

    $httpProvider.interceptors.push('AttachTokens');
})

.factory('AttachTokens', function ($window) {
  var attach = {
    request: function (object) {
      var jwt = $window.localStorage.getItem('com.hikexpert');
      if (jwt) {
        object.headers['x-access-token'] = jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
})

.run(function ($rootScope, $location, Auth, Home, Socket) {
  $rootScope.$on('$routeChangeStart', function (evt, next, current) {
    if (next.$$route && next.$$route.authenticate && !Auth.isAuth()) {
      $location.path('/signin');
    }
    if (!$rootScope.userInfo) {
      $rootScope.userInfo = {};
      Home.getUser()
        .then(function(user){
          $rootScope.userInfo = {
            username: user.username,
            location: user.location,
            trails: user.trails.reduce(function(memo, trailObj){
              memo[trailObj.trailName] = trailObj.done;
              return memo;
            }, {});,
            hikerStatus: user.hikerStatus,
            path: user.path,
            currentTrail: {
              location: user.location,
              name: 'New Trail'
            }
          };
          
          Socket.setSender($rootScope.userInfo.username);
          
          Socket.emit('new user', $rootScope.userInfo.username, function(data) {

          });
        })
        .catch(function(err) {
          console.log('There was an error getting user data:', err);
        });
    }
  });
});
