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

// gets a word and descendant words at descendantDepth, ancestor words at ancestorDepth
// only includes words that have a path to the word (e.g. with word=a, a->b->c includes c, but a->b<-c, doesn't)
function getDirectlyRelatedWords(word, descendantDepth, ancestorDepth) {
	var params = {
		word: word
	};

	// Note: neo4j doesn't allow parametrization of depth, so we stick that into the query ourself
	// be VERY sure that descendantDepth and ancestorDepth are integers!
	var query =
		//'MATCH (ancestor:Word)-[edgeIn:EDGE*0..' + ancestorDepth +']->(word:Word {word: {word}})-[edgeOut:EDGE*0..' + descendantDepth + ']->(descendant:Word)\n' +
		//'RETURN *';
		'MATCH (parent:Word)-[edgeIn:EDGE*0..2]->(source:Word {word: "world"})-[edgeOut:EDGE*0..2]->(child:Word)\n' +
		'UNWIND edgeIn as edgesIn\n' +
		'UNWIND edgeOut as edgesOut\n' +
		'WITH collect(distinct parent) + collect(distinct source) + collect(distinct child) as words1,\n' +
		'     collect(distinct edgesIn) + collect(distinct edgesOut) as edges1\n' +
		'UNWIND words1 as words2\n' +
		'UNWIND edges1 as edges2\n' +
		'RETURN collect(distinct words2) as words, collect(distinct edges2) as edges';
	return db.cypherAsync({
		query: query,
		params: params
	}).then(function(results) {
		return results[0];
	});
}

// gets all words associated with this word, including indirect associations (eg. with word=a, a->b<-c, c will be returned)
function getAllRelatedWords(word, depth) {
}

// add an edge between two words, source and target. if the words don't exist, create them
// every edge must belong to a poem. if the edge already exists for this poem and the poem-type is 'unique', nothing happens
// (note: currently the only type is "unique" so we don't check for that, we just MERGE, which will not be a correct query if there are other poem types)
// returns Promise<{ source, target, edge }>
function createEdge(source, target, poemId) {
	var params = {
		source: source,
		target: target,
		poemId: poemId
	};
	var query =
		'MERGE (source:Word {word: {source}})\n' +
		'MERGE (target:Word {word: {target}})\n' +
		'MERGE (source)-[edge:EDGE {poemId: {poemId}}]->(target)\n' +
		'RETURN source,target,edge';

	return db.cypherAsync({
		query: query,
		params: params
	}).then(function(results) {
		return results[0];
	});
}

// initializes a Poem node for the given poemId
// Returns Promise<Poem>, rejects if the node already exists
function createPoemNode(poemId, type, title) {
	var params = {
		id: poemId,
		type: type,
		title: title
	};
	var query =
		'CREATE (poem:Poem {id: {id}, type: {type}, title: {title}})\n' + 
		'RETURN poem';

	return db.cypherAsync({
		query: query,
		params: params
	}).then(function(results) {
		return results[0].poem;
	});
}

module.exports = {
	getDirectlyRelatedWords: getDirectlyRelatedWords,
	createEdge: createEdge,
	createPoemNode: createPoemNode
};

