// var Chat = require('../../db/models/chat.js');
// var Message = require('../../db/models/message.js');
var connected = {};

module.exports = function(io) {
  io.on('connection', function(socket){
    socket.on('chat:connect', function(data, callback) {
      socket.username = data;
      connected[socket.username] = socket;
      console.log("Sockets connected: " + Object.keys(connected));
      callback();
    });

    socket.on('chat:send', function(data) {
      if(data.recipient in connected) {
        connected[data.recipient].emit('chat:receive', data);
      }
      socket.emit('chat:receive', data);
    });

    socket.on('disconnect', function(data){
      console.log("Disconnected socket: " + socket.username);
      delete connected[socket.username];
      console.log("Sockets connected: " + Object.keys(connected));
    });
  });
}