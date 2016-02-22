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

});