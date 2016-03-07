var chat = require('./handlers/chatSocketHandler');
var location = require('./handlers/locationSocketHandler');

module.exports = function(server) {
  var io = require('socket.io')(server);
  
  chat(io);
  location(io);

  return io;
}