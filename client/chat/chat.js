angular.module('hikexpert.chat', [])

.controller('ChatController', function($scope, $rootScope, Socket){
  $scope.sender = Socket.getSender();
  $scope.recipient = Socket.getRecipient();
  $scope.messages = [];

  Socket.on('new message', function(data) {
    $scope.messages.push(data);
  });

  $scope.sendMessage = function() {
    var message = {
      sender: $scope.sender,
      recipient: $scope.recipient,
      text: $scope.text
    };
    Socket.emit('send message', message);
    $scope.text = '';
    angular.element('#text').focus();
  };
});