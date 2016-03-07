angular.module('hikexpert', [
  'hikexpert.home',
  'hikexpert.auth',
  'hikexpert.user',
  'hikexpert.chat',
  'hikexpert.trail',
  // 'hikexpert.trail',
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

    // We add our $httpInterceptor into the array
    // of interceptors. Think of it like middleware for your ajax calls
    $httpProvider.interceptors.push('AttachTokens');
})

.factory('AttachTokens', function ($window) {
  // this is an $httpInterceptor
  // its job is to stop all out going request
  // then look in local storage and find the user's token
  // then add it to the header so the server can validate the request
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

.run(function ($rootScope, $location, Auth, Home) {
  // here inside the run phase of angular, our services and controllers
  // have just been registered and our app is ready
  // however, we want to make sure the user is authorized
  // we listen for when angular is trying to change routes
  // when it does change routes, we then look for the token in localstorage
  // and send that token to the server to see if it is a real user or hasn't expired
  // if it's not valid, we then redirect back to signin/signup
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
            trails: user.trails,
            path: user.path,
            currentTrail: {
              location: user.location,
              name: 'New Trail'
            }
          }
        })
        .catch(function(err) {
          console.log('There was an error getting user data:', err);
        })
    }
  });
});
