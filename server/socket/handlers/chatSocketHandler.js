var connected = {};

module.exports = function(io) {
  io.on('connection', function(socket){
    socket.on('new user', function(data, callback) {
      socket.username = data;
      connected[socket.username] = socket;
      console.log("Sockets connected: " + Object.keys(connected));
      //callback();
    });

    socket.on('send message', function(data) {
      if(data.recipient in connected) {
        connected[data.recipient].emit('new message', data);
      }
      socket.emit('new message', data);
    });

    socket.on('disconnect', function(data){
      console.log("Disconnected socket: " + socket.username);
      delete connected[socket.username];
      console.log("Sockets connected: " + Object.keys(connected));
    });
  });
}