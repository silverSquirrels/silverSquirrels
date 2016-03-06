angular.module('hikexpert.services', [])

.factory('Home', function($http, Socket){

  var getTrails = function(userInfo){
    return $http({
      method: 'POST',
      url: 'api/trails',
      data: userInfo
    }).then(function(res){
      return res.data;
    })
    .catch(function(err) {
      console.error('There was an error getting trails from the server:', err);
    });
  };

  var getCoords = function(searchData) {
    return $http({
      method: 'POST',
      url: '/api/coords',
      data: searchData
    }).then(function(res) {
      return res.data;
    })
    .catch(function(err) {
      console.error('There was an error getting coorinates from server:', err);
    });
  };

  var getUser = function(){
    return $http({
      method: 'GET',
      url: '/user/getUser'
    })
    .then(function (res) {
      return res.data;
    });
  };
  // Puts trails in hasDone or wantToDo arrays, based on the url endpoint used
  var trailPost = function (trailName) {
    return $http({
      method: 'POST',
      url: 'user/trails',
      data: {trailName: trailName}
    });
  };

  var trailPut = function(trailName) {
    return $http({
      method: 'PUT',
      url: '/user/trails',
      data: {trailName: trailName}
    });
  }

  var commentPost = function(options){
    console.log("comentPost");
    return $http({
      method: 'POST',
      url : '/comment',
      data: options
    });
  };

  var getComments = function(trail){
    console.log(trail);
    var uriComponent = encodeURIComponent(trail);
    console.log(uriComponent);
    return $http({
      method: 'GET',
      url : '/comments?trail=' + uriComponent
    }).then(function(res){
      return(res.data);

    });
  }

  return {
    getTrails: getTrails,
    getCoords: getCoords,
    getUser: getUser,
    trailPost: trailPost,
    trailPut: trailPut,
    commentPost : commentPost,
    getComments : getComments
  };
})

.factory('Auth', function($http, $location, $window) {
  var signin = function(user) {
    return $http({
      method: 'POST',
      url: '/signin',
      data: user
    })
    .then(function(res) {
      return res.data.token;
    });
  };

  var signup = function(user) {
    return $http({
      method: 'POST',
      url: '/signup',
      data: user
    })
    .then(function(res) {
      return res.data.token;
    });
  };

  var isAuth = function() {
    return !!$window.localStorage.getItem('com.hikexpert');
  };

  var signout = function() {
    $window.localStorage.removeItem('com.hikexpert');
    $location.path('/signin');
  };

  return {
    signin: signin,
    signup: signup,
    isAuth: isAuth,
    signout: signout
  };
})

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
})

.factory('Socket', function($rootScope) {
  var socket = io.connect({query: "username=" + $rootScope.username});
  var on = function (eventName, callback) {
    socket.on(eventName, function () {
      var args = arguments;
      $rootScope.$apply(function () {
        callback.apply(socket, args);
      });
    });
  };

  var emit = function (eventName, data, callback) {
    socket.emit(eventName, data, function () {
      var args = arguments;
      $rootScope.$apply(function () {
        if (callback) {
          callback.apply(socket, args);
        }
      });
    });
  };

  return {
    on: on,
    emit: emit
  };
});
