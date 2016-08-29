var socketio = require('socket.io');

var io;

function listen(server, options) {
	io = socketio(server);
	var phraseMazeIo = io.of('/phrase-maze');
}
