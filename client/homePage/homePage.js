angular.module('hikexpert.home', [])

.controller('HomePageController', function($scope){
  var map;
  $scope.initMap = function() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
}
})


//AIzaSyAJellxFV2jDFD2AQdv6yiG1i6SfMnvx5o