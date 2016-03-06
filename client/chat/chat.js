angular.module('hikexpert.chat', [])

.controller('ChatController', function($scope, $rootScope, Socket){
  console.log(Socket.sender);
  $scope.sender = Socket.getSender();
  $scope.recipient = 'john';
  $scope.messages = [];
  //$scope.messages = [{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},{sender: 'b', text: 'sd'},];


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