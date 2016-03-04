angular.module('hikexpert.user', [])

.controller('UserController', function($scope, $rootScope, $window, Friend, Home){
  /***************************
    USER
  ****************************/

  ///// Get user's name and trails upon load
  $scope.getUser = function(){
    queryHome('getUser', null, function(data) {
      $scope.userInfo.username = data.username;
      $scope.userInfo.haveDone = data.haveDone;
      $scope.userInfo.wantToDo = data.wantToDo;
      
      //set progress bar lengths
      var hikes = $scope.userInfo.haveDone.length;
      var barLength = (hikes / 5 * 100).toString() + '%';
      fillBar('#hikeFive', 5, hikes);
      fillBar('#hikeTwentyFive', 25, hikes);
      fillBar('#hikeHundred', 100, hikes);
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
    var hikes = $scope.userInfo.haveDone.length;
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
        if(friend.hasDone >= 100){
          friend.hikerStatus = 'Explorer';
        } else if(friend.hasDone >= 25){
          friend.hikerStatus = 'Hiker';
        } else if(friend.hasDone >= 5){
          friend.hikerStatus = 'Wanderer';
        } else {
          friend.hikerStatus = 'City-Dweller';
        }
      });
    })
    .catch(function(err) {
      console.error(err);
    });
  };
  
  /****************************
    HELPERS
  *****************************/
  var queryHome = function(homeMethod, body, callback) {
    $scope.getting_markers = true;
    Home[homeMethod](body)
      .then(function(data){
        callback(data);
      })
      .catch(function(err) {
        console.error('There was an error rendering icons:', err);
      });
      
    $scope.getting_markers = false;
  };
  
  /***************************
    PAGE INITIALIZATION
  ***************************/
  $scope.userInfo = {};
  $scope.userInfo.location = {};
  $scope.hikerStatus = 'City-Dweller';
  $scope.getUser();
});