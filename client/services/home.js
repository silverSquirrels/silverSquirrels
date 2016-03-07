angular.module('home.services', [])
  .factory('Home', function($http, Socket){

    var getTrails = function(userInfo){
      return $http({
        method: 'POST',
        url: 'api/trails',
        data: userInfo
      }).then(function(res){
        return res.data;
      })
      .catch(function(err) {
        console.error('There was an error getting trails from the server:', err);
      });
    };

    var getCoords = function(searchData) {
      return $http({
        method: 'POST',
        url: '/api/coords',
        data: searchData
      }).then(function(res) {
        return res.data;
      })
      .catch(function(err) {
        console.error('There was an error getting coordinates from server:', err);
      });
    };

    var getUser = function(){
      return $http({
        method: 'GET',
        url: '/user/getUser'
      })
      .then(function (res) {
        return res.data;
      });
    };

    var commentPost = function(options){
      console.log("comentPost");
      return $http({
        method: 'POST',
        url : '/comment',
        data: options
      });
    };

    var getComments = function(trail){
      console.log(trail);
      var uriComponent = encodeURIComponent(trail);
      console.log(uriComponent);
      return $http({
        method: 'GET',
        url : '/comments?trail=' + uriComponent
      }).then(function(res){
        return(res.data);

      });
    }

    return {
      getTrails: getTrails,
      getCoords: getCoords,
      getUser: getUser,
      commentPost : commentPost,
      getComments : getComments
  };
});