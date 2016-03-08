angular.module('hikexpert.trail', [])
  .controller('TrailController', function($rootScope, $scope, Map, Socket, Home, Trail) {
    $scope.exists = true;
    $scope.markers = [];
    $scope.userTrails = $rootScope.userInfo.trails.reduce(function(memo, trail) {
      var name = trail.name || trail.trailName
      if (trail.done) {
        memo[name] = {};
        memo[name].done = true
        return memo;
      } else {
        memo[name] = {};
        memo[name].done = false
        return memo;
      }
    }, {});
    $scope.saved = !!$scope.userTrails[$rootScope.userInfo.currentTrail.name] 
      || false;
    
    Map.createMap($scope, $rootScope.userInfo.currentTrail.location, function(map) {
      if ($rootScope.userInfo.currentTrail.name === 'New Trail') {
        Map.placeUserMarker(map);
      } else {
        var curr = $rootScope.userInfo.currentTrail;
        Map.placeTrailMarker($scope, curr, curr.done ? 'yellowIcon' : 'greenIcon');
      }
    });
    
    $scope.updateInterval = setInterval(function (){
      Map.updateUserLocation(function sync () {
        Socket.emit('coords', {user: $rootScope.userInfo.username, location: $rootScope.userInfo.location});
          if (!!$rootScope.userInfo.marker) {
            $rootScope.userInfo.marker.setLatLng([$rootScope.userInfo.location.lat, $rootScope.userInfo.location.long]);
          }
      });
    }, 5000);
    
    $scope.saveTrail = function(trail) {
      if (!$scope.userTrails[trail.name]) {
        addTrailToUserTrails(trail);
        Trail.post(trail)
          .then(function(result) {
            $rootScope.userInfo.trails.push(trail);
            $scope.hasDone = !$scope.hasDone;
            $rootScope.userInfo.currentTrail.done = $scope.hasDone;
            Map.emptyMap($scope);
            var curr = $rootScope.userInfo.currentTrail;
            Map.placeTrailMarker($scope, curr, curr.done ? 'yellowIcon' : 'greenIcon');
          })
          .catch(Trail.errorHandler);
      } else {
        trail.done = !$scope.hasDone;
        Trail.put(trail)
          .then(function(result, next) {
            var idx = $rootScope.userInfo.trails.reduce(function(memo, rootTrail, i) {
              if (trail.name === rootTrail.name) {
                return i;
              } else {
                return memo;
              }
            }, -1);
            if (idx === -1) {
              next(new Error('There was an error updating userInfo.trails'));
            } else {
              $scope.hasDone = !$rootScope.hasDone;
              $rootScope.userInfo.trails[idx] = trail;
            }
            Map.emptyMap($scope);
            var curr = $rootScope.userInfo.currentTrail;
            Map.placeTrailMarker($scope, curr, curr.done ? 'yellowIcon' : 'greenIcon');
          })
      }
    };
    
    var addTrailToUserTrails = function(trail) {
      $scope.userTrails[trail.name] = trail;
      $scope.userTrails[trail.name].done = false;
    };
    
    $scope.createTrail = function(trail) {
      if (!trail) {
        $scope.exists = false;
        Map.emptyMap($scope);
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
    
    // var polyFriendsConfig = { color: 'blue', weight: 6, opacity: 0.9 };
    // var polyUserConfig = { color: 'red', weight: 6, opacity: 0.9 };
    // var userLocs = {}
    // Socket.on('coordsResp', function(data){
    //   for(var user in data){
    //     if( !userLocs[user] ){
    //       userLocs[user] = [];
    //     }else{
    //       var y = 0.0001; //mock
    //       for(var i=0;i<data[user].length;i++){
    //         if( user=='user' ){
    //           var x = data[user][i][0] + y;
    //           y=y-0.0001;
    //           var pt = new L.LatLng(x ,data[user][i][1])
    //         }else{
    //           var pt = new L.LatLng(data[user][i][0],data[user][i][1])
    //         }
    //         userLocs[user].push(pt)
    //       }
    //     }
    //     Map.renderPath(userLocs[user], polyUserConfig, $scope);
    //   }
    // })
  });
  