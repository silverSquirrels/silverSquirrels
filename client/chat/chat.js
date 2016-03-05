angular.module('hikexpert.chat', [])

.controller('ChatController', function($scope, Socket){
  $scope.messages = [];

  Socket.on('new message', function(data) {
    $scope.messages.push(data);
  });

  $scope.sendMessage = function() {
    console.log($scope.text);
    Socket.emit('send message', $scope.text);
    $scope.text = '';
    angular.element('#text').focus();
  };
  

});