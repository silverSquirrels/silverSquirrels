angular.module('hikexpert.auth', [])

.controller('AuthController', function ($scope, $window, $location, Auth) {
  $scope.user = {};

  $scope.signin = function () {
    Auth.signin($scope.user)
      .then(function (token) {
        $window.localStorage.setItem('com.hikexpert', token);
        $location.path('/homepage');
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  $scope.signup = function () {
    Auth.signup($scope.user)
      .then(function (token) {
        $window.localStorage.setItem('com.hikexpert', token);
        $location.path('/homepage');
      })
      .catch(function (error) {
        console.error(error);
      });
  };
  
  // clean up comments
  $scope.signout = function () {
    Auth.signout();
  };
});
