(function(window) {

	var PhraseMaze = function(nodes, links, nodeClickHandler) {
		this.svg = null;
		this.width = null;
		this.height = null;
		this.color = null;
		this.simulation = null;
		this.nodes = nodes || [];
		this.links = links || [];
		this.nodesGroup = null;
		this.linksGroup = null;
		this.nodeClickHandler = nodeClickHandler;
		this.initialize();
		this.update();
	};

	PhraseMaze.prototype.initialize = function() {
		var _this = this;
		_this.svg = d3.select("svg");
		_this.width = _this.svg.attr("width");
		_this.height = _this.svg.attr("height");

		_this.color = d3.scaleOrdinal(d3.schemeCategory20);

		// marker is an arrowhead
		_this.svg.append('defs').selectAll('marker')
		.data(['edge'])
		.enter().append('marker')
			.attr('id', function(d) { return d; })
			.attr("viewBox", "0 -5 10 10")
			.attr("refX", 15)
			.attr("refY", -1.5)
			.attr("markerWidth", 6)
			.attr("markerHeight", 6)
			.attr("orient", "auto")
			.attr('fill', '#aaa')
		.append("path")
			.attr("d", "M0,-5L10,0L0,5");

		_this.nodesGroup = _this.svg.append('g')
			.attr('class', 'nodes');
		_this.linksGroup = _this.svg.append('g')
			.attr('class', 'links');

		_this.simulation = d3.forceSimulation()
			.force("link", d3.forceLink().id(function(d) { return d.word; }).distance(60))
			.force("charge", d3.forceManyBody()
					.strength(-120))
			.force("center", d3.forceCenter(_this.width / 2, _this.height / 2))
	};

	PhraseMaze.prototype.update = function() {
		var _this = this;

		_this.simulation
			.nodes(_this.nodes)
			.on("tick", ticked);

		_this.simulation.force("link")
			.links(_this.links)
			.id(function(d, i) { return d.word; });

		_this.simulation.alphaTarget(0.3).restart();


		var link = _this.linksGroup.selectAll('g')
			.data(_this.links, function(d, i) { return [d.source.word, d.target.word].join(','); });

		var newLink = link.enter().append('g');
		newLink
			.append('line')
			.attr('marker-end', function(d) { return 'url(#edge)'; })
			.attr("stroke", "#aaa")
			.attr("stroke-width", function(d) { return Math.sqrt(1); });

		var oldLink = link.exit();
		oldLink.remove();

		var node = _this.nodesGroup.selectAll('g')
			.data(_this.nodes, function(d, i) { return d.word; });

		node.selectAll('text').attr("fill", function(d) { if(d.explored) { return _this.color(2); } else { return _this.color(/*d.group*/1); } });

		var newNode = node.enter().append('g');

		//newNode.on('click', function() { _this.nodeClickHandler.apply(this, arguments); });

		newNode.call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended));

		newNode.append('text')
			.text(function(d) { return d.word; })
			.attr("fill", function(d) { if(d.explored) { return _this.color(3); } else { return _this.color(/*d.group*/1); } });

		var oldNode = node.exit();
		oldNode.remove();

		var allLink = link.merge(newLink);
		var allNode = node.merge(newNode);

		function ticked() {
			allLink.selectAll('line')
				.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });

			allNode
				.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
		}

		function dragstarted(d) {
			if (!d3.event.active) _this.simulation.alphaTarget(0.3).restart();
			d.fx = d.x;
			d.fy = d.y;
		}

		function dragged(d) {
			d.fx = d3.event.x;
			d.fy = d3.event.y;
			_this.nodeClickHandler.apply(this, arguments);
		}

		function dragended(d) {
			if (!d3.event.active) _this.simulation.alphaTarget(0);
			d.fx = null;
			d.fy = null;
		}
	};

	window.PhraseMaze = PhraseMaze;


		/*
		var graph = {
			"nodes": [
			{"id": "hello", "group": 1},
			{"id": "world", "group": 1},
			{"id": "sam", "group": 2},
			{"id": "elliot", "group": 3},
			{"id": "the", "group": 4},
			{"id": "future", "group": 4},
			{"id": "is", "group": 4},
			{"id": "now", "group": 4},
			],
			"links": [
			{"source": "hello", "target": "world", "value": 5},
			{"source": "hello", "target": "sam", "value": 1},
			{"source": "hello", "target": "elliot", "value": 1},
			{"source": "world", "target": "the", "value": 1},
			{"source": "the", "target": "future", "value": 1},
			{"source": "future", "target": "is", "value": 1},
			{"source": "is", "target": "now", "value": 1},
			{"source": "now", "target": "sam", "value": 1},
			]
		};
		*/

	var pm = null;
	var once = false;
	var lastWord = 'hello';
	var socket = io.connect('/phrase-maze');
	socket.on('/words/directly-related', function(response) {
		//console.log(response);
		//graph = response.body;
		//window.graphA = graph;
		console.log(response.body);

		if(!pm) {
			pm = new PhraseMaze(response.body.words, response.body.edges, function(d) {
				if(d.explored) {
					return;
				}
				lastWord = d.word;
				d.explored = true;
				socket.emit('/words/directly-related', {
					method: 'GET',
					body: {
						word: d.word,
						ancestorDepth: 1,
						descendantDepth: 1
					}
				});
			});
			//setTimeout(function() {
				//console.log('did it');
				//pm.nodes.pop();
				//while(pm.links.length > 1) {
					//pm.links.pop();
				//}
				//pm.update();
			//}, 1000);
			//graph.words.forEach(function(w) {
				//pm.nodes.push(w);
			//});
			//graph.edges.forEach(function(e) {
				//pm.links.push(e);
			//});
			//pm.update();
			//graph.words.push({word: 'heyo' });

			/*
			setTimeout(function() {
				socket.emit('/words/directly-related', {
					method: 'GET',
					body: {
						word: 'hello',
						ancestorDepth: 5,
						descendantDepth: 5
					}
				});
			}, 1000);
			*/
		}
		else {
			// add new data
			var lastWordNode = pm.nodes.find(function(n) { return n.word === lastWord; });
			response.body.words.forEach(function(w, i) {
				var node = pm.nodes.find(function(n) { return n.word === w.word; });
				if(!node) {
					console.log('a', w);
					w.x = lastWordNode.x;
					w.y = lastWordNode.y;
					pm.nodes.push(w);
				}
			});
			response.body.edges.forEach(function(e, i) {
				var link = pm.links.find(function(l) { return l.source.word === e.source && l.target.word === e.target && l.value.poemId === e.value.poemId; });
				if(!link) {
					console.log('b', e);
					pm.links.push(e);
				}
			});
			//if an entry in the new data also exists in the old data, we want the old version since it has the simulation data
			/*
			graph.words.forEach(function(w, i) {
				var node = pm.nodes.find(function(n) { return n.word === w.word; });
				if(node) {
					graph.words[i] = node;
				}
			});
			graph.edges.forEach(function(e, i) {
				var link = pm.links.find(function(l) { return l.source.word === e.source && l.target.word === e.target && l.value.poemId === e.value.poemId; });
				if(link) {
					graph.edges[i] = link;
				}
			});
			pm.nodes = graph.words;
			pm.links = graph.edges;
			*/
			//add each new edge one at a time so the graph doesn't spaz
			//pm.nodes.push({word: 'hiya'});
			//pm.links.push({source: 'hiya', target: 'view', value: { poemId: 0 }});
			//pm.links.push({source: 'worldly', target: 'view', value: { poemId: 0 }});
			//var newNodes = pm.nodes.map(function(n) { return n;});
			//newNodes.push({word: 'hoooo'});
			//var newLinks = pm.links.map(function(l) { return l;});
			//newLinks.push({source: 'worldly', target: 'view', value: { poemId: 0 }});
			//newLinks.push({source: 'view', target: 'one', value: { poemId: 0 }});
			//newLinks.push({source: 'one', target: 'hello', value: { poemId: 0 }});
			//newLinks.push({source: 'hello', target: 'war', value: { poemId: 0 }});
			//pm.nodes = newNodes;
			//pm.links = newLinks;
			pm.update();
		}
	});

	socket.emit('/words/directly-related', {
		method: 'GET',
		body: {
			word: 'hello',
			ancestorDepth: 1,
			descendantDepth: 1
		}
	});


})(window)
