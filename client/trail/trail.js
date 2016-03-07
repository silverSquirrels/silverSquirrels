angular.module('hikexpert.trail', [])
  .controller('TrailController', function($rootScope, $scope, Map, Socket, Home) {
    $scope.exists = true;
    $scope.saved = false;
    $scope.hasDone = $rootScope.userInfo.trails.reduce(function(memo, trail) {
      if (trail.done) {
        return true;
      } else {
        return false;
      }
    }, false);
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
        var polyFriendsConfig = { color: 'blue', weight: 6, opacity: 0.9 };
    var polyUserConfig = { color: 'red', weight: 6, opacity: 0.9 };
    var userLocs = {}
    Socket.on('coordsResp', function(data){
      for(var user in data){
        if( !userLocs[user] ){
          userLocs[user] = [];
        }else{
          var y = 0.0001; //mock
          for(var i=0;i<data[user].length;i++){
            if( user=='user' ){
              var x = data[user][i][0] + y;
              y=y-0.0001;
              var pt = new L.LatLng(x ,data[user][i][1])
            }else{
              var pt = new L.LatLng(data[user][i][0],data[user][i][1])
            }
            userLocs[user].push(pt)
          }
        }
        Map.renderPath(userLocs[user], polyUserConfig, $scope);
      }
    })
  });
  