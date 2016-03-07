angular.module('hikexpert.trail', [])
  .controller('TrailController', function($rootScope, $scope, Map, Socket, Home) {
    $scope.exists = true;
    $scope.saved = false;
    Map.createMap($scope, $rootScope.userInfo.currentTrail.location, function(map) {
      Map.placeUserMarker(map);
    });
    
    $scope.updateInterval = setInterval(function (){
      Map.updateUserLocation(function sync () {
        Socket.emit('coords', {user: $rootScope.userInfo.username, location: $rootScope.userInfo.location});
          if (!!$rootScope.userInfo.marker) {
            $rootScope.userInfo.marker.setLatLng([$rootScope.userInfo.location.lat, $rootScope.userInfo.location.long]);
          }
      });
    }, 5000);
    
    $scope.createTrail = function(trail) {
      if (!trail) {
        $scope.exists = false;
        $scope.map.setView([$rootScope.userInfo.location.lat, $rootScope.userInfo.location.long]);
        Map.placeUserMarker($scope.map);
      }
      trail = trail || {
        name: undefined,
        location: $rootScope.userInfo.location,
        path: []
      };
      $rootScope.userInfo.currentTrail = trail;
    };
  });
  