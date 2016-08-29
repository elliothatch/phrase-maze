var Promise = require('bluebird');
var neo4j = require('neo4j');

var dbConfig = {
	host: 'localhost',
	port: '7474',
	password: 'GraphsAreFun'
};

var db = neo4j.GraphDatabase('http://neo4j:' + dbConfig.password + '@' + dbConfig.host + ':' + dbConfig.port);

function addEdge() {

}

