angular.module('hikexpert.home', [])
  .controller('HomePageController', function($scope, $rootScope, $location, Home, Socket, Map){
    $rootScope.userInfo.location.radius = 10;
    $scope.searchData = '';
    $scope.loading = true;
    // TODO: fix getting markers ng-if
    // $scope.getting_markers = false;
    $scope.markers = [];
    // $scope.hikerStatus = 'City-Dweller';
    
    Map.updateUserLocation(function locationUpdated () {
      $scope.loading = false;
      $scope.$apply();
      Map.createMap($scope, $rootScope.userInfo.location, Map.placeUserMarker);
    });
    $scope.comments;
    
    $scope.getTrailsNearUser = function(location){
      Map.getTrailsNearUser(location, $scope);
    };

    $scope.getTrailsNearLocation = function(searchData) {
      Map.getTrailsNearLocation(searchData, $scope);
    };
    
    $scope.goToTrail = function(trail) {
      $rootScope.userInfo.currentTrail = {
        name: trail.name,
        location: {
          lat: trail.coordinates[0],
          long: trail.coordinates[1]
        }
      };
      $location.url('/trail');
    };

    $scope.updateInterval = setInterval(function (){
      Map.updateUserLocation(function sync () {
        Socket.emit('coords', {user: $rootScope.userInfo.username, location: $rootScope.userInfo.location});
          if (!!$rootScope.userInfo.marker) {
            $rootScope.userInfo.marker.setLatLng([$rootScope.userInfo.location.lat, $rootScope.userInfo.location.long]);
          }
      });
    }, 5000);
});
