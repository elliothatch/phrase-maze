var express = require('express');
var http = require('http');

var bodyParser = require('body-parser');
var compress = require('compression');

var Promise = require('bluebird');

var sockets = require('./sockets');
var routes = require('./routes');

// debug
//Promise.longStackTrace();

var app;
var server;
var socketServer;

function start(port, options) {
	var opts = Object.create(options || null);

	app = express();
	server = http.Server(app);
	socketServer = sockets.listen(server, {});

	app.use(compress());
	app.use(bodyParser.json());

	app.use('/', express.static(__dirname + '/../client'));
	app.use('/static/d3', express.static(__dirname + '/../node_modules/d3/build'));
	app.use(routes({}));

	server.listen(port);
	console.log('Listening on port ' + port);
}

module.exports = {
	start: start
};
