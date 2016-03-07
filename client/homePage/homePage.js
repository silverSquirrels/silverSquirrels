angular.module('hikexpert.home', [])
  .controller('HomePageController', function($scope, $rootScope, Home, Socket, Map){
    $rootScope.userInfo.location.radius = 10;
    $scope.searchData = '';
    $scope.loading = true;
    $scope.getting_markers = false;
    $scope.markers = [];
    $scope.hikerStatus = 'City-Dweller';
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


    Socket.setSender($rootScope.userInfo.username);
    Socket.emit('new user', $rootScope.userInfo.username, function(data) {

    });
    /*************
      SOCKETS
    **************/

    $scope.updateInterval = setInterval(function (){
      Map.updateUserLocation(function sync () {
        Socket.emit('coords', {user: $rootScope.userInfo.username, location: $rootScope.userInfo.location});
        if (!!$rootScope.userInfo.marker) {
          $rootScope.userInfo.marker.setLatLng([$rootScope.userInfo.location.lat, $rootScope.userInfo.location.long]);
        }
      });
    }, 5000);

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
////////////   MOCK DATA SET 1    //////////////////////////////
            if( user=='JT' ){
              var x = data[user][i][0] + y;
              y=y-0.0001;
              var pt = new L.LatLng(x ,data[user][i][1])
            }else{
/////////////////////////////////////////////////////////////////
              var pt = new L.LatLng(data[user][i][0],data[user][i][1])
            }
            userLocs[user].push(pt)
          }
        }
        Map.renderPath(userLocs[user], polyUserConfig, $scope);
      }
    })
//////////     MOCK DATA SET 2  /////////////////////////////////
    var polylinePts = [
      new L.LatLng(40.65154, -73.972485),
      new L.LatLng(40.652023, -73.972813),
      new L.LatLng(40.652771, -73.9731),
      new L.LatLng(40.65331, -73.973201),
      new L.LatLng(40.653032, -73.971973),
      new L.LatLng(40.653535, -73.972013),
      new L.LatLng(40.655041, -73.973013),
      new L.LatLng(40.655041, -73.973013),
      new L.LatLng(40.655041, -73.973013),
      new L.LatLng(40.655041, -73.973013),
      new L.LatLng(40.655041, -73.973013),
      new L.LatLng(40.653067, -73.968264),
      new L.LatLng(40.653067, -73.968264),
      new L.LatLng(40.653067, -73.968264)
    ];                                                                                                
    // setInterval(function(){
    //   Map.renderPath(polylinePts, polyUserConfig, $scope);
    // },3000);           

});
