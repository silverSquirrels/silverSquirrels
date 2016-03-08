angular.module('map.services', [])
  .factory('Map', function($rootScope, $compile, Home) {
    var mapMarker = L.AwesomeMarkers.icon({
      icon: 'map-marker',
      iconColor: 'red' //#F0F0C9
    });
    var yellowIcon = L.AwesomeMarkers.icon({
      icon: 'tree-conifer',
      iconColor: '#C6C013'
    });

    var greenIcon = L.AwesomeMarkers.icon({
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
    
    var getPopupHTML = function(trail) {
      return '<a ng-click="goToTrail(trail)">{{ trail.name }}</a>';
    }
    
    var compileMarker = function(html, trail, $scope) {
      var linkFunction = $compile(angular.element(html));
      var newScope = $scope.$new();
      newScope.trail = trail;
      newScope.goToTrail = $scope.goToTrail;
      
      return linkFunction(newScope)[0];
    }

    var markerCases = {
      true: function hasDone(trail, $scope) {
        var html = getPopupHTML(trail);
        
        return L.marker(trail.coordinates, {icon: greenIcon, title: trail.name})
          .bindPopup(compileMarker(html, trail, $scope))
          .addTo($scope.map)
          .openPopup();
      },
      false: function wantsToDo(trail, $scope) {
        var html = getPopupHTML(trail);
        return L.marker(trail.coordinates, {icon: yellowIcon, title: trail.name})
          .bindPopup(compileMarker(html, trail, $scope))
          .addTo($scope.map)
          .openPopup();
      },
      notInList: function notInList(trail, $scope) {
        var html = getPopupHTML(trail);
        return L.marker(trail.coordinates, {title: trail.name})
          .bindPopup(compileMarker(html, trail, $scope))
          .addTo($scope.map);
      }
    }

    var createMap = function($scope, location, callback) {
      var map = L.map('map')
        .setView([location.lat, location.long], 9);
      $scope.map = map;

      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZWR1bGlzOCIsImEiOiJjaWt1M2RzeW8wMDk4dnltM3h5ZXlwb24wIn0.DfujBg6HeQHg5ja-tZyYRw',
      {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.satellite',
        accessToken: 'pk.eyJ1IjoiZWR1bGlzOCIsImEiOiJjaWt1M2RzeW8wMDk4dnltM3h5ZXlwb24wIn0.DfujBg6HeQHg5ja-tZyYRw'
      })
      .addTo(map);
      
      callback(map);
    };
    
    var placeUserMarker = function(map) {
      $rootScope.userInfo.marker = L.marker([$rootScope.userInfo.location.lat, $rootScope.userInfo.location.long], {icon: mapMarker, autoPan: false});
      $rootScope.userInfo.marker.addTo(map).bindPopup("Here you are")
        .openPopup();
    };
    
    var markers = {
      greenIcon: greenIcon,
      yellowIcon: yellowIcon
    }
    
    var placeTrailMarker = function(map, trail, type) {
      L.marker([trail.location.lat, trail.location.long], {icon: markers[type]})
        .addTo(map)
        .bindPopup(trail.name)
        .openPopup();
    };
    
    var getTrailsNearUser = function(location, $scope){
      emptyMap($scope);
      updateUserLocation(function(position) {
        $rootScope.userInfo.marker.openPopup();
        $scope.map.setView([position.coords.latitude, position.coords.longitude]);
        Home.getTrails($rootScope.userInfo.location)
          .then(function(data){
            data.forEach(function(trail){
              $scope.trails[trail.name] = trail;
            })
            renderTrails(data, $scope);
          });
      });
    };

    var getTrailsNearLocation = function(searchData, $scope) {
      emptyMap($scope);
      Home.getCoords({search: searchData})
        .then(function(location) {
          // Add radius so the query to trailAPI works
          location.radius = $rootScope.userInfo.location.radius;
          $scope.map.setView([location.lat, location.long]);
          $rootScope.userInfo.marker.closePopup();
          Home.getTrails(location)
            .then(function(data) {
              data.forEach(function(trail){
                $scope.trails[trail.name] = trail;
              })
              renderTrails(data, $scope);
            });
        });
    };

    var updateUserLocation = function(callback) {
      navigator.geolocation.getCurrentPosition(function(position) {
        $rootScope.userInfo.location.lat = position.coords.latitude;
        $rootScope.userInfo.location.long = position.coords.longitude;
        callback(position);
      })
    };

    var emptyMap = function($scope) {
      $scope.getting_markers = true;
      $scope.markers.forEach(function (marker) {
        $scope.map.removeLayer(marker);
        $scope.markers = [];
      });
      $scope.getting_markers = false;
    };

    var renderTrails = function(data, $scope) {
      // data is a bunch of trail objects from the API
      data.forEach(function(trail, i){
        var marker;
        if (!!$rootScope.userInfo[trail.name]) {
          marker = markerCases[$rootScope.userInfo.trails[trail.name]](trail, $scope);
        } else {
          marker = markerCases['notInList'](trail, $scope);
          var seeCommentsHTML = "<a class=see-comments>See comments for this trail</a>"
          var commentFormHTML = "<form class=comment-form><span class=hidden>"+ trail.name + "</span><textarea class='comment-text' placeholder='Comments'></textarea><br />Rating<select class='rating'><option value=1''>1</option><option value='2'>2</option><option value='3'>3</option><option value='4'>4</option></select>  Difficulty:<select class='difficulty'><option value=1''>1</option><option value='2'>2</option><option value='3'>3</option><option value='4'>4</option></select><br />Hours to hike<input type=number class='time'></number><br /><button type='button' class=comment-button>click</button></form>";
          var statsDisplayHTML = "<p class=rating-disp>Rating: " + trail.rating + "</p> <p class=difficulty-disp>Difficulty: " + trail.difficulty + "</p> <p class=time-disp>Time: " + trail.time + "</p>" + seeCommentsHTML;
          // TODO: fix or refactor markers 
          // var marker;
          // if ( $rootScope.userInfo.haveDone.indexOf(trail.name) > -1 ) {
          //   marker = L.marker(trail.coordinates, {icon: greenIcon, title: trail.name})
          //     .bindPopup('<b>'+trail.name+'</b><br /><a class="want-to">I want to hike this again<span class="hidden">'+trail.name+'</span></a>' + commentFormHTML).addTo($scope.map).openPopup();
          // }
          // if ( $rootScope.userInfo.wantToDo.indexOf(trail.name) > -1 ) {
          //   marker = L.marker(trail.coordinates, {icon: yellowIcon, title: trail.name})
          //     .bindPopup('<b>'+trail.name+'</b><br /><a class="have">I have hiked this<span class="hidden">'+trail.name+'</span></a>' + statsDisplayHTML).addTo($scope.map).openPopup();
          // }
          // if ( $rootScope.userInfo.wantToDo.indexOf(trail.name) === -1 && $rootScope.userInfo.haveDone.indexOf(trail.name) === -1) {
          //   marker = L.marker(trail.coordinates, {title: trail.name})
          //     .bindPopup('<b>'+trail.name+'</b><br /><a class="have">I have hiked this<span class="hidden">'+trail.name+'</span></a><br /><a class="want-to">I want to hike this<span class="hidden">'+trail.name+'</span></a>' + statsDisplayHTML).addTo($scope.map);
          // }
          $scope.markers.push(marker);
        }
      });  
    };

    var changeColor = function (trailName, icon, intent) {
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

    var renderPath = function(points, config, $scope){
      var line = new L.Polyline(points, config).addTo( $scope.map );
      // *** Will refocus window- do we want ??
      $scope.map.fitBounds(line.getBounds());
    }

    return {
      renderPath: renderPath,
      createMap: createMap,
      placeUserMarker: placeUserMarker,
      placeTrailMarker: placeTrailMarker,
      getTrailsNearUser: getTrailsNearUser,
      getTrailsNearLocation: getTrailsNearLocation,
      updateUserLocation: updateUserLocation,
      emptyMap: emptyMap,
      renderTrails: renderTrails,
      changeColor: changeColor
    }
  });
