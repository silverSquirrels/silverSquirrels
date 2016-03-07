angular.module('hikexpert.home', [])
  .controller('HomePageController', function($scope, $rootScope, Home, Socket, Map){
    $scope.trails = {};
    $rootScope.userInfo = {};
    $rootScope.userInfo.location = {};
    $rootScope.userInfo.location.radius = 10;
    $rootScope.userInfo.trails = {};
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

    Home.getUser()
      .then(function(data) {
        $rootScope.userInfo.username = data.username;
        Socket.setSender($rootScope.userInfo.username);
        Socket.emit('new user', $rootScope.userInfo.username, function(data) {

        });
        $rootScope.userInfo.trails = data.trails.reduce(function(memo, trailObj){
          memo[trailObj.trailName] = trailObj.done;
          return memo;
        }, {});
        $rootScope.userInfo.trail = data.trail;
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
            if( user=='JT' ){                                                                 //
              var x = data[user][i][0] + y;                                             //
              y=y-0.0001;                                                                   //
              var pt = new L.LatLng(x ,data[user][i][1])                        //
            }else{                                                                                //
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
    var polylinePts = [                                                                     //
      new L.LatLng(40.65154, -73.972485),                                    //
      new L.LatLng(40.652023, -73.972813),                                  //
      new L.LatLng(40.652771, -73.9731),                                      //
      new L.LatLng(40.65331, -73.973201),                                    //
      new L.LatLng(40.653032, -73.971973),                                  //
      new L.LatLng(40.653535, -73.972013),                                  //
      new L.LatLng(40.655041, -73.973013),                                  //
      new L.LatLng(40.655041, -73.973013),                                  // 
      new L.LatLng(40.655041, -73.973013),                                  //
      new L.LatLng(40.655041, -73.973013),                                  //
      new L.LatLng(40.655041, -73.973013),                                  //
      new L.LatLng(40.653067, -73.968264),                                  //
      new L.LatLng(40.653067, -73.968264),                                  //
      new L.LatLng(40.653067, -73.968264)                                   //
    ];                                                                                                //
    // setInterval(function(){                                                            //
    //   Map.renderPath(polylinePts, polyUserConfig, $scope);       //
    // },3000);                                                                                  //
//////////////////////////////////////////////////////////////////


    /****************
      LISTENERS
    *****************/
    // jQuery workaround to implement click listeners
    // Bug: one click is transformed into two clicks. 
    // Somehow these click listeners get registered twice.
    $('body').on('click', '.have', function(){
      var trailName = $(this).children().html();
      if (!!$rootScope.userInfo.trails[trailName]) {
        Home.trailPut(trailName)
          .then(function(result) {
            $rootScope.userInfo.trails[trailName] = !$rootScope.userInfo.trails[trailName];
            $scope.changeColor(trailName, $scope.greenIcon, 'did it');
          })
          .catch(function(err) {
            console.error('There was an error changing the user\'s trail property!', err);
          });
      } else {
        Home.trailPost(trailName)
          .then(function(result) {
            $rootScope.userInfo.trails[trailName] = true;
            $scope.changeColor(trailName, $scope.greenIcon, 'did it');
          })
          .catch(function(err) {
            if (err) {
              console.log('There was an error adding the trail to the user\'s trails:', err);
            }
          });
      }
    });

    $('body').on('click', '.want-to', function(){
      var trailName = $(this).children().html();
      if (!!$rootScope.userInfo.trails[trailName]) {
        Home.trailPut(trailName)
          .then(function(result) {
            $rootScope.userInfo.trails[trailName] = !$rootScope.userInfo.trails[trailName];
            $scope.changeColor(trailName, yellowIcon);
          })
          .catch(function(err) {
            console.error('There was an error changing the user\'s trail property!', err);
          });
      } else {
        Home.trailPost(trailName)
          .then(function(result) {
            $rootScope.userInfo.trails[trailName] = false;
            $scope.changeColor(trailName, yellowIcon);
          })
          .catch(function(err) {
            if (err) {
              console.error('There was an error adding the trail to the user\'s trails:', err);
            }
          })
      }
    });

    $('body').on('click', '.comment-button', function(){
      var $form = $(this).parent();
      console.log($form);
      var options = {
        trail: $form.find('.hidden').html(),
        text : $form.find('.comment-text').val(),
        rating: $form.find('.rating').val(),
        difficulty : $form.find('.difficulty').val(),
        time : $form.find('.time').val()
      };
      $form.parent().html("Thank you for your submission");
      console.log(options);
      Home.commentPost(options);
    });

    $('body').on('click', '.see-comments', function(){
      var $parent = $(this).parent();
      console.log($parent);
      var trail = $parent.find('.hidden').html()
      Home.getComments(trail).then(function(commentsData){
        console.log(commentsData);
        $scope.comments = commentsData;
      });
    });
});
