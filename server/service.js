var dao = require('./dao');

var uuid = require('node-uuid');

//TODO: input validation

// creates an edge between src and target, with the given poemId
// if src or target do not exist, they are created
function createEdge(src, target, poemId) {
	return dao.createEdge(src, target, poemId);
}

// creates a poemId and a unique node for the poem
// returns Promise<UUID> -- resolves with the poemId
function createPoem(type) {
	if(type !== 'unique') {
		return Promise.reject(new Error('Invalid poem type'));
	}
	var poemId = uuid.v4();
	return dao.createPoemNode(poemId, type)
		.then(function() {
			return poemId;
		});
}
