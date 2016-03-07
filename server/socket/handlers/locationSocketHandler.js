var userLocHistory = {}

module.exports = function(io) {
	function userLocs(data){
      	if( userLocHistory[data.user] ){
        		userLocHistory[data.user].push([data.location.lat, data.location.long]);
      	}else{
			userLocHistory[data.user]=[ [data.location.lat, data.location.long] ] ;
	      }
	      userLocHistory[data.user].length >= 50 && ( userLocHistory[data.user].splice(0,10) );
    };

	io.on('connection', function(socket){
		socket.on('coords', function syncCoords(data) {
			userLocs(data);
			require('../../controllers/userControllers.js').updateLocation(data);
			io.sockets.emit('coordsResp', userLocHistory);
		});
	});

}