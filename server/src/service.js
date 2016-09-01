var dao = require('./dao');

var uuid = require('node-uuid');

//TODO: input validation


function getDirectlyRelatedWords(word, descendantDepth, ancestorDepth) {
	return dao.getDirectlyRelatedWords(word, descendantDepth, ancestorDepth)
		.then(function(results) {
			var words = results.words.map(function(wordNode) {
				return wordNode.properties;
			});
			
			// we want to convert edges to objects of form { source, target, value }
			// where source and target are the word strings and value is the object of edge properties

			// first, create a lookup map for node Ids
			var nodeMap = results.words.reduce(function(map, wordNode) {
				map[wordNode._id] = wordNode.properties.word;
				return map;
			}, {});

			var edges = results.edges.map(function(edgeNode) {
				return {
					source: nodeMap[edgeNode._fromId],
					target: nodeMap[edgeNode._toId],
					value: edgeNode.properties
				};
			});
			return {
				words: words,
				edges: edges
			};
		});
}

// creates an edge from source to target, with the given poemId
// if source or target do not exist, they are created
// returns Promise<>
function createEdge(source, target, poemId) {
	return dao.createEdge(source, target, poemId)
		.then(function(results) {
			var properties = Object.keys(results).reduce(function(obj, pName) {
				obj[pName] = results[pName].properties;
				return obj;
			}, {});
			return properties;
		});
}

// creates a poemId and a unique node for the poem
// returns Promise<Object> -- resolves with the poem object
function createPoem(type, title) {
	if(type !== 'unique') {
		return Promise.reject(new Error('Invalid poem type'));
	}

	var poemId = uuid.v4();
	return dao.createPoemNode(poemId, type, title)
		.then(function(poemNode) {
			return poemNode.properties;
		});
}

module.exports = {
	getDirectlyRelatedWords: getDirectlyRelatedWords,
	createEdge: createEdge,
	createPoem: createPoem
};
