angular.module('hikexpert.chat', [])

.controller('ChatController', function($scope, $rootScope, Socket){
  var sender = $rootScope.username;
  var recipient = 'john';
  $scope.messages = [];

  Socket.on('new message', function(data) {
    $scope.messages.push(data);
  });

  $scope.sendMessage = function() {
    var message = {
      sender: sender,
      recipient: recipient,
      text: $scope.text
    };
    Socket.emit('send message', message);
    $scope.text = '';
    angular.element('#text').focus();
  };

});