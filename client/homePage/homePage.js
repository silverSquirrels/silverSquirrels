angular.module('hikexpert.home', [])

.controller('HomePageController', function($scope, $rootScope, Home){
 
  $scope.userInfo = {}; 
  $scope.loading = true;
  $scope.markers = [];

  //window.markers = [];

  ///// Get user's name and trails upon load
  $scope.getUser = function(){
    Home.getUser()
    .then (function (data) {
      $scope.userInfo.username = data.username;
      $scope.userInfo.haveDone = data.haveDone;
      $scope.userInfo.wantToDo = data.wantToDo;
    })
    .catch(function (err) {
      console.log('error in getUser', err);
    });
  };
  $scope.getUser();
  ///////
  $scope.trailPost = Home.trailPost;

  $scope.moveTrail = function (trailName, url) {
    Home.trailPost(trailName, url)
    .then(function (response) {
      if(response) {
        console.log(response)
        $scope.getUser();
      }
    });
  };

  var myIcon = L.icon({
    iconUrl : 'http://stuff.samat.org/Test-Cases/Leaflet/881-Marker-Subclassing/marker-icon-red.png'
  });


  $scope.getCoords = function(userInfo){
    console.log('userinfo in getcoords', userInfo)
    $scope.loading = true;  
    $scope.markers.forEach(function (marker) {
      $scope.map.removeLayer(marker);
    });
    navigator.geolocation.getCurrentPosition(function(position) {
        $scope.userInfo.lat = position.coords.latitude;
        $scope.userInfo.long = position.coords.longitude;
        console.log('userinfo before factory', userInfo);
        Home.getCoords(userInfo)
        .then(function(data){
          //$scope.coordinates =
          console.log('data in HomePageController', data);
          data.forEach(function(trail, i){
            marker = new L.marker(trail.coordinates, {title: trail.name}, {icon : myIcon})
            // push to our own array?
            // when clicked, alter this html/css
              .bindPopup('<b>'+trail.name+'</b><br /><a class="have">I have hiked this<span class="hidden">'+trail.name+'</span></a><br /><a class="want-to">I want to hike this<span class="hidden">'+trail.name+'</span></a>').addTo($scope.map);

            //window.markers.push(marker);
            $scope.markers.push(marker);
          });
        $scope.loading = false;  
        });
      });
  };

  ///// Get user's location, render a leaflet map showing that location when they land on this page
  navigator.geolocation.getCurrentPosition(function(position) {
    console.log(position.coords.latitude, position.coords.longitude);
    var lat = position.coords.latitude;
    var long = position.coords.longitude;

    // Couldn't get the ng-if to work on spiffygiv...
    $scope.loading = false;   
    // So use apply...makes it work!
    $scope.$apply();

    console.log(lat);
    console.log(long);

    // Initialize the leaflet map:
    var map = L.map('map').setView([lat, long], 9);
    // Set it on the angular scope:
    $scope.map = map;
    // Add a tile layer to our map (from mapbox):
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZWR1bGlzOCIsImEiOiJjaWt1M2RzeW8wMDk4dnltM3h5ZXlwb24wIn0.DfujBg6HeQHg5ja-tZyYRw', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.satellite',
      accessToken: 'pk.eyJ1IjoiZWR1bGlzOCIsImEiOiJjaWt1M2RzeW8wMDk4dnltM3h5ZXlwb24wIn0.DfujBg6HeQHg5ja-tZyYRw'
    }).addTo(map);

      // Add a circle showing user's location to the map
    var circle = L.circle([lat, long], 500, {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 1
    }).addTo(map).bindPopup("Current Location").openPopup();
  });


  // Ugly jQuery hack to implement click listeners
  $('body').on('click', '.have', function(){
    console.log('name of trail', $(this).children().html());
    var trailName = $(this).children().html();
    //console.log(trailName)

    $scope.trailPost(trailName, '/hasDone');

    $scope.getUser();

  });

  $('body').on('click', '.want-to', function(){
    console.log('name of trail', $(this).children().html());
    var trailName = $(this).children().html();
    //console.log(trailName)
    $scope.trailPost(trailName, '/wantToDo');
    $scope.getUser();

  });


});





