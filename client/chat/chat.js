angular.module('hikexpert.chat', [])

.controller('ChatController', function($scope, Socket){

  $scope.sendMessage = function() {
    console.log($scope.text);
    Socket.emit('send message', $scope.text);
    $scope.text = '';
    angular.element('#text').focus();
  };
  
});