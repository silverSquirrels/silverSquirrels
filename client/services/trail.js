angular.module('trail.services', [])
  .factory('Trail', function($rootScope, $http) {
    var post = function (trail) {
      return $http({
        method: 'POST',
        url: '/user/trails',
        data: {trail: trail}
      });
    };

    var put = function(trail) {
      return $http({
        method: 'PUT',
        url: '/user/trails',
        data: {trail: trail}
      });
    }
    
    var errorHandler = function(err) {
      console.log('There was an error quering /user/trails:', err);
    }
    return {
      post: post,
      put: put,
      errorHandler: errorHandler
    };
  })