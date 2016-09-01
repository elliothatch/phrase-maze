var dao = require('./dao');

var uuid = require('node-uuid');

//TODO: input validation

// creates an edge from src to target, with the given poemId
// if src or target do not exist, they are created
// returns Promise<>
function createEdge(src, target, poemId) {
	return dao.createEdge(src, target, poemId);
}

// creates a poemId and a unique node for the poem
// returns Promise<Object> -- resolves with the poem object
function createPoem(type, title) {
	if(type !== 'unique') {
		return Promise.reject(new Error('Invalid poem type'));
	}

	var poemId = uuid.v4();
	return dao.createPoemNode(poemId, type, title)
		.then(function(results) {
			return results[0].p.properties;
		});
}

module.exports = {
	createEdge: createEdge,
	createPoem: createPoem
};
