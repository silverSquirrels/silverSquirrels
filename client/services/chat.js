angular.module('chat.services', [])
  .factory('Chat', function($http) {
    
    var getChat = function() {
      return $http({
        method: 'GET',
        url: '/chat/'
      })
      .then(function(res) {
        return res;
      });
    };

    return {
      getChat: getChat
    };
  });