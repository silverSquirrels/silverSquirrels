angular.module('hikexpert.chat', [])

.controller('ChatController', function($scope, $rootScope, Socket){
  $scope.sender = Socket.getSender();
  $scope.recipient = Socket.getRecipient();
  $scope.messages = [];
  $scope.glued = true;
  angular.element('#text').focus();

  Socket.on('chat:receive', function(data) {
    $scope.messages.push(data);
  });

  $scope.sendMessage = function() {
    var message = {
      sender: $scope.sender,
      recipient: $scope.recipient,
      text: $scope.text
    };
    Socket.emit('chat:send', message, function(data) {
      $scope.messages.push(data);
    });
    $scope.text = '';
    angular.element('#text').focus();
  };

  $scope.getChat = function() {
    var users = {
      sender: $scope.sender,
      recipient: $scope.recipient
    };
    Socket.emit('chat:refresh', users, function(data) {
      $scope.messages = data.messages;
    });
  };
});