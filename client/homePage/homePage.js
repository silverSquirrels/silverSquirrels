angular.module('hikexpert.home', [])
.controller('HomePageController', function($scope, $rootScope, Home, Socket){
  /***************************
    USER
  ****************************/
  $scope.getUser = function(){
    Home.getUser()
      .then(function(data) {
        $scope.userInfo.username = data.username;
        $scope.userInfo.trails = data.trails;
        $scope.userInfo.trail = data.trail;
      });
  };

  $scope.moveTrail = function (trailName, url) {
    Home.trailPost(trailName, url)
    .then(function (response) {
      if(response) {
        $scope.getUser();
      }
    });
  };

  /********************************
    MAP
  ********************************/
  var mapMarker = L.AwesomeMarkers.icon({
    icon: 'map-marker',
    iconColor: 'red' //#F0F0C9
  });
  var yellowIcon = L.AwesomeMarkers.icon({
    icon: 'tree-conifer',
    iconColor: '#C6C013'
  });

  $scope.greenIcon = L.AwesomeMarkers.icon({
    icon: 'tree-conifer',
    iconColor: '#008148'
  });

  var commentFormHTML =
    "<form class='comment-form'> \
      <textarea class='comment-text' placeholder='Comments'></textarea>\
      <br />Rating\
      <select class='rating'>\
        <option value=1''>1</option>\
        <option value='2'>2</option>\
        <option value='3'>3</option>\
        <option value='4'>4</option>\
      </select>\
      Difficulty:\
      <select class='difficulty'>\
        <option value=1''>1</option>\
        <option value='2'>2</option>\
        <option value='3'>3</option>\
        <option value='4'>4</option>\
      </select>\
      <br />Hours to hike<input type=number class='time'></number><br />\
      <button type='button' class=comment-button>click</button>\
    </form>";

  var statsDisplayHTML = function(trail){
    return "<p class=rating-disp>Rating: " + trail.rating + "</p>\
    <p class=difficulty-disp>Difficulty: " + trail.difficulty + "</p>\
    <p class=time-disp>Time: " + trail.time + "</p>";
  };

  var markerCases = {
    true: function hasDone(trail) {
      return L.marker(trail.coordinates, {icon: $scope.greenIcon, title: trail.name})
        .bindPopup(
          '<b>'+trail.name+'</b><br /><a class="want-to">I want to hike this again<span class="hidden">'+trail.name+'</span></a>')
        .addTo($scope.map)
        .openPopup();
    },
    false: function wantsToDo(trail) {
      return L.marker(trail.coordinates, {icon: yellowIcon, title: trail.name})
        .bindPopup('<b>'+trail.name+'</b><br /><a class="have">I have hiked this<span class="hidden">'+trail.name+'</span>')
        .addTo($scope.map)
        .openPopup();
    },
    notInList: function notInList(trail) {
      return L.marker(trail.coordinates, {title: trail.name})
        .bindPopup(
          '<b>'+trail.name+'</b>\
          <br />\
          <a class="have">I have hiked this<span class="hidden">'+trail.name+'</span></a>\
          <br /><a class="want-to">I want to hike this<span class="hidden">'+trail.name+'</span></a>' + statsDisplayHTML(trail))
        .addTo($scope.map);
    }
  }

  $scope.createMap = function() {
    $scope.loading = false;
    // Workaround for spiffygif not working with ng-if
    $scope.$apply();

    var map = L.map('map')
      .setView([$scope.userInfo.location.lat, $scope.userInfo.location.long], 9);
    $scope.map = map;

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZWR1bGlzOCIsImEiOiJjaWt1M2RzeW8wMDk4dnltM3h5ZXlwb24wIn0.DfujBg6HeQHg5ja-tZyYRw',
    {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.satellite',
      accessToken: 'pk.eyJ1IjoiZWR1bGlzOCIsImEiOiJjaWt1M2RzeW8wMDk4dnltM3h5ZXlwb24wIn0.DfujBg6HeQHg5ja-tZyYRw'
    })
    .addTo(map);

    $scope.userInfo.marker = L.marker([$scope.userInfo.location.lat, $scope.userInfo.location.long], {icon: mapMarker, autoPan: false});
    $scope.userInfo.marker.addTo(map).bindPopup("Here you are")
      .openPopup();
  };

  $scope.getTrailsNearUser = function(location){
    $scope.emptyMap();
    $scope.updateUserLocation(function(position) {
      $scope.userInfo.marker.openPopup();
      $scope.map.setView([position.coords.latitude, position.coords.longitude]);
      Home.getTrails($scope.userInfo.location)
        .then(function(data){
          data.forEach(function(trail){
            $scope.trails[trail.name] = trail;
          })
          $scope.renderTrails(data);
        });
    });
  };

  $scope.getTrailsNearLocation = function(searchData) {
    $scope.emptyMap();
    Home.getCoords({search: searchData})
      .then(function(location) {
        // Add radius so the query to trailAPI works
        location.radius = $scope.userInfo.location.radius;
        $scope.map.setView([location.lat, location.long]);
        $scope.userInfo.marker.closePopup();
        Home.getTrails(location)
          .then(function(data) {
            data.forEach(function(trail){
              $scope.trails[trail.name] = trail;
            })
            $scope.renderTrails(data);
          });
      });
  };

  $scope.updateUserLocation = function(callback) {
    navigator.geolocation.getCurrentPosition(function(position) {
      $scope.userInfo.location.lat = position.coords.latitude;
      $scope.userInfo.location.long = position.coords.longitude;
      callback(position);
    })
  };

  $scope.emptyMap = function() {
    $scope.getting_markers = true;
    $scope.markers.forEach(function (marker) {
      $scope.map.removeLayer(marker);
      $scope.markers = [];
    });
    $scope.getting_markers = false;
  };

  $scope.renderTrails = function(data) {
    // data is a bunch of trail objects from the API
    data.forEach(function(trail, i){
      var marker;
      if (!!$scope.userInfo[trail.name]) {
        marker = markerCases[$scope.userInfo.trails[trail.name]](trail);
      } else {
        marker = markerCases['notInList'](trail);
      var seeCommentsHTML = "<a class=see-comments>See comments for this trail</a>"
      var commentFormHTML = "<form class=comment-form><span class=hidden>"+ trail.name + "</span><textarea class='comment-text' placeholder='Comments'></textarea><br />Rating<select class='rating'><option value=1''>1</option><option value='2'>2</option><option value='3'>3</option><option value='4'>4</option></select>  Difficulty:<select class='difficulty'><option value=1''>1</option><option value='2'>2</option><option value='3'>3</option><option value='4'>4</option></select><br />Hours to hike<input type=number class='time'></number><br /><button type='button' class=comment-button>click</button></form>";
      var statsDisplayHTML = "<p class=rating-disp>Rating: " + trail.rating + "</p> <p class=difficulty-disp>Difficulty: " + trail.difficulty + "</p> <p class=time-disp>Time: " + trail.time + "</p>" + seeCommentsHTML;
      var marker;
      if ( $scope.userInfo.haveDone.indexOf(trail.name) > -1 ) {
        marker = L.marker(trail.coordinates, {icon: $scope.greenIcon, title: trail.name})
          .bindPopup('<b>'+trail.name+'</b><br /><a class="want-to">I want to hike this again<span class="hidden">'+trail.name+'</span></a>' + commentFormHTML).addTo($scope.map).openPopup();
      }
      if ( $scope.userInfo.wantToDo.indexOf(trail.name) > -1 ) {
        marker = L.marker(trail.coordinates, {icon: yellowIcon, title: trail.name})
          .bindPopup('<b>'+trail.name+'</b><br /><a class="have">I have hiked this<span class="hidden">'+trail.name+'</span></a>' + statsDisplayHTML).addTo($scope.map).openPopup();
      }
      if ( $scope.userInfo.wantToDo.indexOf(trail.name) === -1 && $scope.userInfo.haveDone.indexOf(trail.name) === -1) {
        marker = L.marker(trail.coordinates, {title: trail.name})
          .bindPopup('<b>'+trail.name+'</b><br /><a class="have">I have hiked this<span class="hidden">'+trail.name+'</span></a><br /><a class="want-to">I want to hike this<span class="hidden">'+trail.name+'</span></a>' + statsDisplayHTML).addTo($scope.map);
      }
      $scope.markers.push(marker);
    });
  };

  $scope.changeColor = function (trailName, icon, intent) {
    var seeCommentsHTML = "<a class=see-comments>See comments for this trail</a>"
    var commentFormHTML = "<form class=comment-form><span class=hidden>"+trailName+"</span><textarea class='comment-text' placeholder='Comments'></textarea><br />Rating<select class='rating'><option value=1''>1</option><option value='2'>2</option><option value='3'>3</option><option value='4'>4</option></select>  Difficulty:<select class='difficulty'><option value=1''>1</option><option value='2'>2</option><option value='3'>3</option><option value='4'>4</option></select><br />Hours to hike<input type=number class='time'></number><br /><button type='button' class=comment-button>click</button></form>";
    var statsDisplayHTML = "<p class=rating-disp>Rating: " + $scope.trails[trailName].rating + "</p> <p class=difficulty-disp>Difficulty: " + $scope.trails[trailName].difficulty + "</p> <p class=time-disp>Time: " + $scope.trails[trailName].time + "</p>" + seeCommentsHTML;
    console.log("changeColor");
    $scope.markers.forEach(function(element, i, arr){
      if(element.options.title === trailName){
        var latlng = element._latlng;
        $scope.map.removeLayer(element);
        element = L.marker([latlng.lat, latlng.lng], {icon: icon, title: trailName} ).addTo($scope.map);
        if(intent === 'did it') {
          element.bindPopup('Been here, done that<br /><b>'+trailName+'</b><br /><a class="want-to">I want to hike this again<span class="hidden">'+trailName+'</span></a>' + commentFormHTML).openPopup();
        }
        else {
          element.bindPopup('<b>'+trailName+'</b><br /><a class="have">I have hiked this<span class="hidden">'+trailName+'</span></a>' + statsDisplayHTML).openPopup();
        }
      }
    });
  };

  /*************************************
    PAGE INITIALIZATION
  *************************************/
  $scope.trails = {};
  $scope.userInfo = {};
  $scope.userInfo.location = {};
  $scope.userInfo.location.radius = 10;
  $scope.userInfo.trails = {};
  $scope.searchData = '';
  $scope.loading = true;
  $scope.getting_markers = false;
  $scope.markers = [];
  $scope.hikerStatus = 'City-Dweller';
  $scope.updateUserLocation($scope.createMap);
  $scope.getUser();
  $scope.comments;

  /*************
    SOCKETS
  **************/

  $scope.updateInterval = setInterval(function (){
    $scope.updateUserLocation(function sync () {
      Socket.emit('coords', {user: $scope.userInfo.username, location: $scope.userInfo.location});
      if (!!$scope.userInfo.marker) {
        $scope.userInfo.marker.setLatLng([$scope.userInfo.location.lat, $scope.userInfo.location.long]);
      }
    });
  }, 5000);

    // TODO: Fix polyline drawing
  // socket.on('coords', function(data){
  //   var users = Object.keys(data);
  //   users.forEach(function(user){
  //     data[user].forEach(function(location){
  //       L.polyline(LatLng[location[0], location[1]], {color: 'red'}).addTo(map);
  //     })
  //   })
  // })

  /****************
    LISTENERS
  *****************/
  // jQuery workaround to implement click listeners
  // Bug: one click is transformed into two clicks. Somehow these click listeners get registered twice. This has no effect on functionality.
  $('body').on('click', '.have', function(){
    var trailName = $(this).children().html();
    if (!!$scope.userInfo.trails[trailName]) {
      Home.trailPut(trailName)
        .then(function(result) {
          console.log(result);
          $scope.userInfo.trails[trailName] = !$scope.userInfo.trails[trailName];
          $scope.changeColor(trailName, $scope.greenIcon, 'did it');
        })
        .catch(function(err) {
          console.error('There was an error changing the user\'s trail property!', err);
        });
    } else {
      Home.trailPost(trailName)
        .then(function(result) {
          $scope.userInfo.trails[trailName] = true;
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
    if (!!$scope.userInfo.trails[trailName]) {
      Home.trailPut(trailName)
        .then(function(result) {
          console.log(result);
          $scope.userInfo.trails[trailName] = !$scope.userInfo.trails[trailName];
          $scope.changeColor(trailName, yellowIcon);
        })
        .catch(function(err) {
          console.error('There was an error changing the user\'s trail property!', err);
        });
    } else {
      Home.trailPost(trailName)
        .then(function(result) {
          console.log(result);
          $scope.userInfo.trails[trailName] = false;
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
