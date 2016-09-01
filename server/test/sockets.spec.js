var expect = require('chai').expect;
var assert = require('chai').assert;

var Promise = require('bluebird');

var http = require('http');
var ioClient = require('socket.io-client');

var sockets = require('../src/sockets');

var host = 'http://127.0.0.1';
var port = 3000;

var server = null;
var io = null;
var client = null;

describe('Socket API', function() {
	beforeEach(function() {
		server = http.createServer();
		io = sockets.listen(server, {});
		server.listen(port);
		client = ioClient(host + ':' + port + '/phrase-maze');
		return new Promise(function(resolve, reject) {
				client.on('connect', function() {
					resolve();
				});
		});
	});

	afterEach(function() {
		server.close();
		server = null;
		io = null;
		client = null;
	});

	describe('GET /poems/create', function() {
		it('should create a new poem node and return its properties', function() {
			return new Promise(function(resolve, reject) {
				client.on('/poems/create', function(response) {
					var id = response.body && response.body.id;
					expect(response).to.deep.equal({
						status: 201,
						headers: {},
						body: {
							id: id, // id should be a random UUID
							type: 'unique',
							title: 'hello'
						}
					});
					expect(response.body.id).to.be.a('string');
					resolve();
				});

				client.emit('/poems/create', {
					method: 'GET',
					body: { type: 'unique', title: 'hello' }
				});
			});
		});
	});

	describe('GET /edges/create', function() {
		it('should create a new edge and nodes', function() {
			return new Promise(function(resolve, reject) {
				client.on('/edges/create', function(response) {
					var id = response.body && response.body.id;
					expect(response).to.deep.equal({
						status: 201,
						headers: {},
						body: {
						}
					});
					resolve();
				});

				client.emit('/edges/create', {
					method: 'GET',
					body: { src: 'hello', target: 'world', poemId: '0' }
				});
			});
		});
	});
});
