angular.module('hikexpert.trail', [])
  .controller('TrailController', function($rootScope, $scope, Map, Socket, Home) {
    $scope.exists = true;
    $scope.saved = false;
    Map.createMap($scope, $rootScope.userInfo.location, function(map) {
      Map.placeUserMarker(map);
    });
    
    $scope.changeTrail = function(trail) {
      if (!trail) {
        $scope.exists = false;
        $scope.map.setView([$rootScope.userInfo.location.lat, $rootScope.userInfo.location.long]);
        Map.placeUserMarker($scope.map);
      }
      trail = trail || {
        name: 'New Trail',
        location: $rootScope.userInfo.location
      };
      $rootScope.currentTrail = trail;
    };
  });
  