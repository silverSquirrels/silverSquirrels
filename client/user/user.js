angular.module('hikexpert.user', [])

.controller('UserController', function($rootScope, $scope, $window, $location, Friend, Home, Socket){
  /***************************
    USER
    ****************************/

  ///// Get user's name and trails upon load
  $scope.getUser = function(){
    Home.getUser()
    .then(function(data) {
      $rootScope.userInfo.username = data.username;
      $rootScope.userInfo.trail = data.trail;

      $rootScope.userInfo.hikes = $rootScope.userInfo.trails.reduce(function(memo, trail) {
        console.log(trail);
        if (trail.done) {
          ++memo.done;
          return memo;
        } 
        ++memo.undone;
        return memo;
      }, {done: 0, undone: 0});
      console.log($rootScope.userInfo.trails);
      var barLength = ($rootScope.userInfo.hikes.done / 5 * 100).toString() + '%';
      fillBar('#hikeFive', 5, $rootScope.userInfo.hikes.done);
      fillBar('#hikeTwentyFive', 25, $rootScope.userInfo.hikes.done);
      fillBar('#hikeHundred', 100, $rootScope.userInfo.hikes.done);
    });
  };
  
  /**************************
    PROGRESS BARS
    **************************/
  //Makes it so numerator cannot exceed denom in progress bar
  $scope.maxFilter = function(current, max){
    if(current > max){
      return max;
    }
    return current;
  };
  //Checks hike count and changes hiker status based on # of hikes
  var updateStatus = function(){
    var hikes = $rootScope.userInfo.hikes.done;
    if(hikes >= 100){
      $scope.hikerStatus = 'Explorer';
    } else if(hikes >= 25){
      $scope.hikerStatus = 'Hiker';
    } else if(hikes >= 5){
      $scope.hikerStatus = 'Wanderer';
    }
  };
  //Given target bar in the form '#barID', hikeTarget as an integer, and total hikes
  //Fills target bar the appropriate percent or 100% if total exceeds target
  var fillBar = function(targetBar, hikeTarget, totalHikes){
    var barLength = (totalHikes / hikeTarget * 100).toString() + '%';
    if(totalHikes < hikeTarget){
      $(targetBar).css('width', barLength);
    } else{
      $(targetBar).css('width', '100%');
    }
    updateStatus();
  };

  $scope.addFriend = function() {
    Friend.addFriend({ newFriend: $scope.newFriend })
    .then(function(res) {
      $scope.addFriendMessage = 'Friend added!';
      $scope.newFriend = '';
      $scope.getFriends();
    })
    .catch(function(err) {
      $scope.addFriendMessage = 'Not found!';
      $scope.newFriend = '';
      console.error(err);
    });
  };

  $scope.getFriends = function() {
    Friend.getFriends()
    .then(function(res) {
      $scope.friends = res.data.friends;


      $scope.friends.forEach(function(friend) {
        friend.haveDone = 0;
        friend.wantToDo = 0;
        for(var i = 0; i < friend.trails.length; i++) {
          console.log(friend.trails[i]);
          if(friend.trails.done) {
            friend.haveDone++;
          } else {
            friend.wantToDo++;
          }
        }
       });
    })
    .catch(function(err) {
      console.error(err);
    });
  };

  $scope.chat = function(index) {
    Socket.setRecipient($scope.friends[index].username);
    Socket.setSender($rootScope.userInfo.username);
    Socket.emit('chat:connect', Socket.getSender(), function() {
      $location.path('/chat');
    });
  };
  
  /***************************
    PAGE INITIALIZATION
    ***************************/
    $rootScope.userInfo.location = {};
    $scope.hikerStatus = 'City-Dweller';
    $scope.getUser();
  });