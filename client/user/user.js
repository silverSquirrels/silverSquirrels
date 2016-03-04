angular.module('hikexpert.user', [])

.controller('UserController', function($scope, $rootScope, $window, Friend){
  $scope.addFriend = function() {
    Friend.addFriend({ newFriend: $scope.newFriend })
    .then(function(data) {
      console.log(data);
    }).catch(function(err) {
      console.error(err);
    });
  };
});