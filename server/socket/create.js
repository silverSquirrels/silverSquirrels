module.exports = function(server) {
  var io=require('socket.io')(server);
  io.on('connection', function(socket){
    console.log('*** Client has Connected');  
    
    socket.on('coords', function syncCoords(data) {
      require('../controllers/userControllers.js').updateLocation(data);
      socket.emit('coords', data);
    });
    
    socket.on('disconnect', function(){
      console.log('!!! User has Disconnected')
    })
  });

  return io;
}