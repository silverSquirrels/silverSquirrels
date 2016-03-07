angular.module('hikexpert.chat', [])

.controller('ChatController', function($scope, $rootScope, Socket, Chat){
  $scope.sender = Socket.getSender();
  $scope.recipient = Socket.getRecipient();
  $scope.messages = [];
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
    Socket.emit('chat:send', message);
    $scope.text = '';
    angular.element('#text').focus();
  };

  $scope.getChat = function() {
    Chat.getChat()
    .then(function(res) {
      console.log(res.data);
    })
    .catch(function(err) {
      console.error(err);
    });
  };
});