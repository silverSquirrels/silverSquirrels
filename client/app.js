angular.module('hikexpert', [
  'hikexpert.home',
  'ngRoute'
])
.config(function($routeProvider, $httpProvider){
  $routeProvider
    .when('/', {
      templateUrl: 'homePage/homepage.html',
      controller: 'HomePageController'
    });
})

