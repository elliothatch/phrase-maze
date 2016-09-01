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

	describe('GET /words/directly-related', function() {
		it('should return all descendant words and edges up to descendantDepth', function() {
		});

		it('should return all ancestor words and edges up to ancestorDepth', function() {
		});

		it('should return both descendant and ancestor words and edges appropriately', function() {
			return new Promise(function(resolve, reject) {
				client.on('/words/directly-related', function(response) {
					//TODO: fix this and use test data
					//expect(response).to.deep.equal({
						//status: 200,
						//headers: {},
						//body: {
						//}
					//});
					resolve();
				});

				client.emit('/words/directly-related', {
					method: 'GET',
					body: { word: 'world', descendantDepth: 2, ancestorDepth: 2 }
				});
			});
		});
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
					expect(response).to.deep.equal({
						status: 201,
						headers: {},
						body: {
							source: { word: 'hello'},
							target: { word: 'world'},
							edge: { poemId: '0'}
						}
					});
					resolve();
				});

				client.emit('/edges/create', {
					method: 'GET',
					body: { source: 'hello', target: 'world', poemId: '0' }
				});
			});
		});
	});
});
