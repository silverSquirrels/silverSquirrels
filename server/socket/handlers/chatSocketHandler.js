var Chat = require('../../db/models/chat.js');
var Message = require('../../db/models/message.js');
var connected = {};

module.exports = function(io) {
  io.on('connection', function(socket){
    socket.on('chat:connect', function(data, callback) {
      socket.username = data;
      connected[socket.username] = socket;
      console.log("Sockets connected: " + Object.keys(connected));
      callback();
    });

    socket.on('chat:send', function(data, callback) {
      if(data.recipient in connected) {
        connected[data.recipient].emit('chat:receive', data);
      }
      socket.emit('chat:receive', data);
    });

    socket.on('chat:refresh', function(data, callback) {
      var test = [
        {
          sender: data.sender,
          recipient: data.recipient,
          text: "yo what up"
        },
        {
          sender: data.recipient,
          recipient: data.sender,
          text: "nm u?"
        }
      ];

      //get data from db andn return thru callback

      callback(test);


    });

    socket.on('disconnect', function(data){
      console.log("Disconnected socket: " + socket.username);
      delete connected[socket.username];
      console.log("Sockets connected: " + Object.keys(connected));
    });
  });
}