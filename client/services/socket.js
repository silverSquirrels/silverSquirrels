angular.module('socket.services', [])
  .factory('Socket', function($rootScope) {
    var socket = io.connect();
    var sender = '';
    var recipient = '';

    var getSender = function() {
      return sender;
    };

    var setSender = function(val) {
      sender = val;
    };

    var getRecipient = function() {
      return recipient;
    };

    var setRecipient = function(val) {
      recipient = val;
    };

    var on = function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    };

    var emit = function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    };

    return {
      getSender: getSender,
      setSender: setSender,
      getRecipient: getRecipient,
      setRecipient: setRecipient,
      on: on,
      emit: emit
    };
});