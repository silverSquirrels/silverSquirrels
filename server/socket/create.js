var connected = {};

module.exports = function(server) {
  var users = {}
  function userLocs(data){
    if( users[data.user] ){
      users[data.user].push([data.lat,data.long]);
    }else{
      users[data.user]=[[data.lat,data.long]];
    }
    users.length >= 100 && ( users.splice(0,10) );
    io.emit('coords', users);
  };

  var io = require('socket.io')(server);
  io.on('connection', function(socket){
    console.log('*** Client has Connected ***');  
    socket.on('new user', function(data, callback) {
      socket.username = data;
      connected[socket.username] = socket;
      console.log("Sockets connected: " + Object.keys(connected));
      //callback();
    });
    

    socket.on('coords', function syncCoords(data) {
      userLocs(data);
      socket.emit('coords', data);
      require('../controllers/userControllers.js').updateLocation(data);
    });


    ////////////////// CHAT //////////////////
    socket.on('send message', function(data) {
      if(data.recipient in connected) {
        connected[data.recipient].emit('new message', data);
      }
      socket.emit('new message', data);
    });



    ///////////////// CHAT //////////////////


    

    socket.on('disconnect', function(data){
      console.log('!!! User has Disconnected !!!');

      ///////////////// CHAT //////////////////

      console.log("Disconnected socket: " + socket.username);
      delete connected[socket.username];
      console.log("Sockets connected: " + Object.keys(connected));




      ///////////////// CHAT //////////////////



    });
  });

  return io;
}