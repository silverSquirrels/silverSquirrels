angular.module('hikexpert.services', [])

.factory('Home', function($http){

  var getTrails = function(userInfo){
    return $http({
      method: 'POST',
      url: 'api/trails',
      data: userInfo
    }).then(function(res){
      return res.data;
    })
    .catch(function(err) {
      console.err('There was an error getting trails from the server:', err);
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
      url: '/getUser'
    })
    .then(function (res) {
      return res.data;
    });
  };
  // Puts trails in hasDone or wantToDo arrays, based on the url endpoint used
  var trailPost = function (trailName, url) {
    var trailObj = {
      trailName : trailName
    };
    return $http({
      method: 'POST',
      url: url,
      data: trailObj
    });
  };

  return {
    getTrails: getTrails,
    getCoords: getCoords,
    getUser: getUser,
    trailPost: trailPost
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

.factory('Friend', function($http, $location, $window) {
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

  return {
    addFriend: addFriend
  };
});