angular.module('hikexpert', [
  'hikexpert.home',
  'hikexpert.auth',
  'ngRoute'
])
.config(function($routeProvider, $httpProvider){
  $routeProvider
    .when('/', {
      templateUrl: 'homePage/homepage.html',
      controller: 'HomePageController'
    })
    .when('/signin', {
      templateUrl: 'auth/signin.html',
      controller: 'AuthController'
    })
    .when('/signup', {
      templateUrl: 'auth/signup.html',
      controller: 'AuthController'
    });
})

