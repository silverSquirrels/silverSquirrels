angular.module('hikexpert.services', [])

.factory('Home', function($http){

  var getCoords = function(userInfo){
    console.log('userInfo in factory $http func', userInfo);
    return $http({
      method: 'POST',
      url: 'api/coords',
      data: userInfo
    }).then(function(resp){
      console.log('response in the factory', resp);
      return resp.data;
    });
  };

  return {
    getCoords : getCoords
  };
})

.factory('Auth', function($http, $location, $window) {
  var signin = function(user) {
    return $http({
      method: 'POST',
      url: '/signin',
      data: user
    })
    .then(function(resp) {
      return resp.data.token;
    });
  };
  
  var signup = function(user) {
    return $http({
      method: 'POST',
      url: '/signup',
      data: user
    })
    .then(function(resp) {
      return resp.data.token;
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
    signin : signin,
    signup : signup,
    isAuth : isAuth,
    signout : signout
  };
});