angular.module('friend.services', [])
  .factory('Friend', function($http) {
    var addFriend = function(newFriend) {
      return $http({
        method: 'PUT',
        url: '/friends/add',
        data: newFriend
      })
      .then(function(res) {
        return res;
      });
    };

    var getFriends = function() {
      return $http({
        method: 'GET',
        url: '/friends/all'
      })
      .then(function(res) {
        return res;
      });
    };

    return {
      addFriend: addFriend,
      getFriends: getFriends
    };
  })

  .factory('Chat', function($http) {

    return {};
  });