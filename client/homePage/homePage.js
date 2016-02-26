angular.module('hikexpert.home', [])
.controller('HomePageController', function($scope, $rootScope, Home){
 
  $scope.userInfo = {}; 
  $scope.loading = true;
  $scope.getting_markers = false;
  $scope.markers = [];
  $scope.hikerStatus = 'City-Dweller';
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
      $scope.hikerStatus = 'Explorer'
    } else if(hikes >= 25){
      $scope.hikerStatus = 'Hiker';
    } else if(hikes >= 5){
      $scope.hikerStatus = 'Wanderer';
    }
  }
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
  }

  ///// Get user's name and trails upon load
  $scope.getUser = function(){
    Home.getUser()
    .then (function (data) {
      $scope.userInfo.username = data.username;
      $scope.userInfo.haveDone = data.haveDone;
      $scope.userInfo.wantToDo = data.wantToDo;
      

      //set progress bar lengths
      var hikes = $scope.userInfo.haveDone.length;
      var barLength = (hikes / 5 * 100).toString() + '%';
      fillBar('#hikeFive', 5, hikes);
      fillBar('#hikeTwentyFive', 25, hikes);
      fillBar('#hikeHundred', 100, hikes);
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
        $scope.getUser();
      }
    });
  };

  // Icons for map //
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
  

  ////////////////////////
  $scope.getCoords = function(userInfo){
    $scope.getting_markers = true;  
    $scope.markers.forEach(function (marker) {
      $scope.map.removeLayer(marker);
      $scope.markers = [];
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
            var marker;
            // If trail is in the wantToDo array
            //console.log(trail.name);
            // If it is in the haveDone array, makes its class 'want-to' and give option 'i want to hike again'
            if ( $scope.userInfo.haveDone.indexOf(trail.name) > -1 ) {
              marker = L.marker(trail.coordinates, {icon: $scope.greenIcon})
                .bindPopup('<b>'+trail.name+'</b><br /><a class="want-to">I want to hike this again<span class="hidden">'+trail.name+'</span></a>').addTo($scope.map).openPopup();
              // L.marker will not take more than two parameters ... !?
              // So title is set here:
              marker.options.title = trail.name;
            } 
            // If it is in the wantToDo array, makes its class be 'have' and give option 'i have hiked this'
            // If it is in both, set icon to yellow so they can say they have hiked it (again)
            if ( $scope.userInfo.wantToDo.indexOf(trail.name) > -1 ) {
              marker = L.marker(trail.coordinates, {icon: yellowIcon})
                .bindPopup('<b>'+trail.name+'</b><br /><a class="have">I have hiked this<span class="hidden">'+trail.name+'</span>').addTo($scope.map).openPopup();
              // L.marker will not take more than two parameters ... !?
              // So title is set here:
              marker.options.title = trail.name;

            }
            // If it's not in either array, keep it default blue icon
            if ( $scope.userInfo.wantToDo.indexOf(trail.name) === -1 && $scope.userInfo.haveDone.indexOf(trail.name) === -1) {
              marker = L.marker(trail.coordinates, {title: trail.name})
              // This is part of an ugly jQuery hack. Hidden spans contain the name of the trail, so we can get at that later. Undoubtedly, there is a better way to do this.
                .bindPopup('<b>'+trail.name+'</b><br /><a class="have">I have hiked this<span class="hidden">'+trail.name+'</span></a><br /><a class="want-to">I want to hike this<span class="hidden">'+trail.name+'</span></a>').addTo($scope.map);
            }
            $scope.markers.push(marker);
          });
        $scope.getting_markers = false;  
        });
      });
  };

  

  ///// Get user's location, render a leaflet map showing that location when they land on this page
  navigator.geolocation.getCurrentPosition(function(position) {
    console.log(position.coords.latitude, position.coords.longitude);
    var lat = position.coords.latitude;
    var long = position.coords.longitude;

    // Couldn't get the ng-if to work on spiffygif...
    $scope.loading = false;   
    // So use apply...makes it work!
    $scope.$apply();
    
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

    L.marker([lat, long], {icon: mapMarker}).addTo(map).bindPopup("Here you are").openPopup();

  });

  // Ugly jQuery hack to implement click listeners
  $('body').on('click', '.have', function(){
    //console.log('name of trail', $(this).children().html());
    var trailName = $(this).children().html();

    // make this its own function
    $scope.changeColor(trailName, $scope.greenIcon, 'did it');
    //////////// ^^^^^

    $scope.trailPost(trailName, '/hasDone');

    $scope.getUser();

  });

  $('body').on('click', '.want-to', function(){
    console.log('name of trail', $(this).children().html());
    var trailName = $(this).children().html();
    $scope.changeColor(trailName, yellowIcon);
    $scope.trailPost(trailName, '/wantToDo');
    $scope.getUser();
  });

  ///// Helpers ////
  $scope.changeColor = function (trailName, icon, intent) {
      $scope.markers.forEach(function(element, i, arr){
      if(element.options.title === trailName){
        var latlng = element._latlng;

        $scope.map.removeLayer(element);
        
        element = L.marker([latlng.lat, latlng.lng], {icon: icon} ).addTo($scope.map);
        // L.marker will not take more than two parameters ... !?
        // So title is set here:
        element.options.title = trailName;
        // If they clicked "I have hiked this":
        // Remove the 'have hiked' option
        if(intent === 'did it') {
          element.bindPopup('Been here, done that<br /><b>'+trailName+'</b><br /><a class="want-to">I want to hike this again<span class="hidden">'+trailName+'</span></a>').openPopup();
        } 
        // If they clicked "I want to hike this":
        // Remove the 'want to' option
        else {
          element.bindPopup('<b>'+trailName+'</b><br /><a class="have">I have hiked this<span class="hidden">'+trailName+'</span>').openPopup();
        }
      }
    });
  };
});





