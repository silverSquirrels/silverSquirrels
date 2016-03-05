angular.module('hikexpert.home', [])
.controller('HomePageController', function($scope, $rootScope, Home){
  /***************************
    USER
  ****************************/
  $scope.getUser = function(){
    Home.getUser()
      .then(function(data) {
        $scope.userInfo.username = data.username;
        $scope.userInfo.haveDone = data.haveDone;
        $scope.userInfo.wantToDo = data.wantToDo;
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
  
  $scope.createMap = function() {
    $scope.loading = false;   
    // Workaround for spiffygif not working with ng-if
    $scope.$apply();

    var map = L.map('map').setView([$scope.userInfo.location.lat, $scope.userInfo.location.long], 9);
    $scope.map = map;
    
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZWR1bGlzOCIsImEiOiJjaWt1M2RzeW8wMDk4dnltM3h5ZXlwb24wIn0.DfujBg6HeQHg5ja-tZyYRw', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.satellite',
      accessToken: 'pk.eyJ1IjoiZWR1bGlzOCIsImEiOiJjaWt1M2RzeW8wMDk4dnltM3h5ZXlwb24wIn0.DfujBg6HeQHg5ja-tZyYRw'
    }).addTo(map);

    $scope.userInfo.marker = L.marker([$scope.userInfo.location.lat, $scope.userInfo.location.long], {icon: mapMarker});
    $scope.userInfo.marker.addTo(map).bindPopup("Here you are").openPopup();
  };
  
  $scope.getTrailsNearUser = function(location){
    $scope.emptyMap();
    $scope.updateUserLocation(function(position) {
      $scope.map.addEventListener('popupopen');
      $scope.map.setView([position.coords.latitude, position.coords.longitude]);
      Home.getTrails($scope.userInfo.location)
        .then(function(data){
          $scope.renderTrails(data);
        });
    });
  };
  
  $scope.getTrailsNearLocation = function(searchData) {
    $scope.emptyMap();
    Home.getCoords(JSON.stringify({search: searchData}))
      .then(function(location) {
        // Add radius so the query to trailAPI works
        location.radius = $scope.userInfo.location.radius;
        $scope.map.setView([location.lat, location.long]);
        $scope.map.removeEventListener('popupopen');
        Home.getTrails(location)
          .then(function(data) {
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
      if ( $scope.userInfo.haveDone.indexOf(trail.name) > -1 ) {
        marker = L.marker(trail.coordinates, {icon: $scope.greenIcon, title: trail.name})
          .bindPopup('<b>'+trail.name+'</b><br /><a class="want-to">I want to hike this again<span class="hidden">'+trail.name+'</span></a>').addTo($scope.map).openPopup();
      } 
      if ( $scope.userInfo.wantToDo.indexOf(trail.name) > -1 ) {
        marker = L.marker(trail.coordinates, {icon: yellowIcon, title: trail.name})
          .bindPopup('<b>'+trail.name+'</b><br /><a class="have">I have hiked this<span class="hidden">'+trail.name+'</span>').addTo($scope.map).openPopup();
      }
      if ( $scope.userInfo.wantToDo.indexOf(trail.name) === -1 && $scope.userInfo.haveDone.indexOf(trail.name) === -1) {
        marker = L.marker(trail.coordinates, {title: trail.name})
          .bindPopup('<b>'+trail.name+'</b><br /><a class="have">I have hiked this<span class="hidden">'+trail.name+'</span></a><br /><a class="want-to">I want to hike this<span class="hidden">'+trail.name+'</span></a>').addTo($scope.map);
      }
      $scope.markers.push(marker);
    });
  };

  $scope.changeColor = function (trailName, icon, intent) {
    $scope.markers.forEach(function(element, i, arr){
      if(element.options.title === trailName){
        var latlng = element._latlng;
        $scope.map.removeLayer(element);
        element = L.marker([latlng.lat, latlng.lng], {icon: icon, title: trailName} ).addTo($scope.map);
        if(intent === 'did it') {
          element.bindPopup('Been here, done that<br /><b>'+trailName+'</b><br /><a class="want-to">I want to hike this again<span class="hidden">'+trailName+'</span></a>').openPopup();
        }
        else {
          element.bindPopup('<b>'+trailName+'</b><br /><a class="have">I have hiked this<span class="hidden">'+trailName+'</span>').openPopup();
        }
      }
    });
  };
  
  /*************************************
    PAGE INITIALIZATION
  *************************************/
  $scope.userInfo = {};
  $scope.userInfo.location = {};
  $scope.userInfo.location.radius = 10;
  $scope.searchData = '';
  $scope.loading = true;
  $scope.getting_markers = false;
  $scope.markers = [];
  $scope.hikerStatus = 'City-Dweller';
  $scope.updateUserLocation($scope.createMap);
  $scope.getUser();

  /*************
    SOCKETS
  **************/
  $scope.updateInterval = setInterval(function (){
    $scope.updateUserLocation(function sync () {
      Home.syncLocation($scope.userInfo.username, $scope.userInfo.location)
    });
    if (!!$scope.userInfo.marker) {
      $scope.userInfo.marker.setLatLng([$scope.userInfo.location.lat, $scope.userInfo.location.long]);
    }   
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
    $scope.changeColor(trailName, $scope.greenIcon, 'did it');
    Home.trailPost(trailName, '/hasDone');
    $scope.moveTrail(trailName, '/moveTrails');
  });

  $('body').on('click', '.want-to', function(){
    var trailName = $(this).children().html();
    $scope.changeColor(trailName, yellowIcon);
    Home.trailPost(trailName, '/wantToDo');
    // Re-render new info, waiting a bit so DB has time to finish saving:
    setTimeout(function(){
      $scope.getUser();
    }, 400);
  });
});
