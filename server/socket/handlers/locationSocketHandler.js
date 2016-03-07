var users = {}

module.exports = function(io) {
	function userLocs(data){
		if( users[data.user] ){
			users[data.user].push([data.lat,data.long]);
		}else{
			users[data.user]=[[data.lat,data.long]];
		}
		users.length >= 100 && ( users.splice(0,10) );
		io.emit('coords', users);
	};

	io.on('connection', function(socket){
		console.log('*** Client has Connected ***');  

		socket.on('coords', function syncCoords(data) {
			userLocs(data);
			socket.emit('coords', data);
			require('../../controllers/userControllers.js').updateLocation(data);
		});

		socket.on('disconnect', function(data){
			console.log('!!! User has Disconnected !!!');
		});
	});

}