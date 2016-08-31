var socketio = require('socket.io');

var io;

function listen(server, options) {
	io = socketio(server);
	var phraseMazeIo = io.of('/phrase-maze');

	phraseMazeIo.use(function(socket, next) {
		// add an edge between words
		// { src: string, target: string }
		socket.on('/words/add', function(data) {
			
		});
	});
}

module.exports = {
	listen: listen
};
