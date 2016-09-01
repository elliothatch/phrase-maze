var Promise = require('bluebird');
var neo4j = require('neo4j');
var config = require('config');

var dbConfig = config.get('db');

var db = new neo4j.GraphDatabase('http://neo4j:' + dbConfig.password + '@' + dbConfig.host + ':' + dbConfig.port);

Promise.promisifyAll(db);

// schema:
// UUID is a 64-bit unique identifier, stored as hex string (automatically compressed by neo4j)
// each word is a node with label "Word" and properties:
//    word: string
// connections are relationships with label "EDGE" and properties:
//    poemId: UUID
// poems are collections of connections. extra info about poems is stored in a node with label "Poem" and properties:
//    id: string: UUID
//    type: string ("unique")
//       "unique" - a poem where each word is unique (no duplicate words)
//    name: string
//    author(?): UUID (not currently implemented)

// gets a word to the given depth
function getWord(word, depth) {
}

// add an edge between two words, src and target. if the words don't exist, create them
// every edge must belong to a poem. if the edge already exists for this poem and the poem-type is 'unique', nothing happens
// (note: currently the only type is "unique" so we don't check for that, we just MERGE, which will not be a correct query if there are other poem types)
function createEdge(src, target, poemId) {
	var params = {
		src: src,
		target: target,
		poemId: poemId
	};
	var query =
		'MERGE (w1:Word {word: {src}})\n' +
		'MERGE (w2:Word {word: {target}})\n' +
		'MERGE (w1)-[:EDGE {poemId: {poemId}}]->(w2)';

	return db.cypherAsync({
		query: query,
		params: params
	}).then(function(results) {
		return undefined;
	});
}

// initializes a Poem node for the given poemId
// Returns Promise<>, rejects if the node already exists
function createPoemNode(poemId, type, title) {
	var params = {
		id: poemId,
		type: type,
		title: title
	};
	var query =
		'CREATE (p:Poem {id: {id}, type: {type}, title: {title}})' + 
		'RETURN p';

	return db.cypherAsync({
		query: query,
		params: params
	}).then(function(results) {
		return results;
	});
}

module.exports = {
	createEdge: createEdge,
	createPoemNode: createPoemNode
};

