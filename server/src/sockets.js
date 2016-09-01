var socketio = require('socket.io');
var socketioRouter = require('fresh-socketio-router');

var service = require('./service');

var io;

function listen(server, options) {
	io = socketio(server);
	var phraseMazeIo = io.of('/phrase-maze');

	var router = socketioRouter.Router();

	// get directly related words
	// params: { word, ancestorDepth, descendantDepth }
	router.get('/words/directly-related', function(req, res, next) {
		service.getDirectlyRelatedWords(req.body.word, req.body.ancestorDepth, req.body.descendantDepth)
			.then(function(words) {
				res.status(200).send(words);
			})
			.catch(function(err) {
				return next(err);
			});
	});

	// create a new poem
	// params: { type: string }
	// returns { id: poemId, type: type }
	router.get('/poems/create', function(req, res, next) {
		service.createPoem(req.body.type, req.body.title)
			.then(function(poem) {
				res.status(201).send(poem);
			})
			.catch(function(err) {
				return next(err);
			});
	});

	// add an edge between words
	// params: { source: string, target: string }
	// returns { source, target, edge }, where each field is an object with key-value pairs of properties
	router.get('/edges/create', function(req, res, next) {
		service.createEdge(req.body.source, req.body.target, req.body.poemId)
			.then(function(properties) {
				res.status(201).send(properties);
			})
			.catch(function(err) {
				return next(err);
			});
	});

	router.use(function(err, req, res, next) {
		if(!err.status) {
			err.status = 500;
		}
		if(err.status >= 500) {
			console.error(err.stack);
		}
		res.status(err.status).send(err.message || 'Internal Server Error');
	});

	phraseMazeIo.use(socketioRouter(router));

	return io;
}

module.exports = {
	listen: listen
};
