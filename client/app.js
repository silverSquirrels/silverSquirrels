angular.module('hikeXpert', [
  'ngRoute',
  'hikeXpert.HomePageController'
])
.config(function($routeProvider, $httpProvider){
  $routeProvider
    .when('/', {
      templateUrl: 'homePage/homepage.html',
      controller: 'HomePage'
    });
})

.controller('', []);