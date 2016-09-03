(function(window) {

	var PhraseMaze = function(nodes, links) {
		this.svg = null;
		this.width = null;
		this.height = null;
		this.color = null;
		this.simulation = null;
		this.nodes = nodes || [];
		this.links = links || [];
		this.nodesGroup = null;
		this.linksGroup = null;
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

	};

	PhraseMaze.prototype.update = function() {
		var _this = this;



		/*
		var link = _this.svg.selectAll('line')
			.data(_this.links, function(d, i) { return d.source + ',' + d.target + ',' + d.value.poemId; });

		link.enter().append('line')
			.attr('class', 'link');

		link.exit().remove();

		var node = _this.svg.selectAll('g.node')
			.data(_this.nodes, function(d, i) { return d.word; });

		var nodeEnter = node.enter().append('g')
			.attr('class', 'node')
			.call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended));

		nodeEnter.append('svg:circle')
			.attr('r', 16)
			.attr('class', 'nodeStrokeClass');

		nodeEnter.append('svg:text')
			.attr('class', 'textClass')
			.text(function(d) { return d.word; });

		node.exit().remove();

		_this.simulation
			.nodes(_this.nodes)
			.on("tick", ticked);

		_this.simulation.force("link")
			.links(_this.links);

		function ticked() {
			node.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
			//node.selectAll('g.text')
				//.attr("x", function(d) { return d.x; })
				//.attr("y", function(d) { return d.y; });

			link
				.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });


			//newNodes
				//.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
		}

		//force.on('tick', function() {
			//node.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });

			//link.attr('x1', function(d) { return d.source.x; })
				//.attr('y1', function(d) { return d.source.y; })
				//.attr('x2', function(d) { return d.target.x; })
				//.attr('y2', function(d) { return d.target.y; });
		//});

		// restart the force layout
		//force
			//.gravity(0.05)
			//.distance(50)
			//.linkDistance(50)
			//.size([_this.width, _this.height])
			//.start();

			*/
		var link = _this.linksGroup.selectAll('line')
			.data(_this.links, function(d, i) { return d.source + ',' + d.target + ',' + d.value.poemId; });

		var newLink = link.enter().append('g');
		newLink.append('line')
			.attr('marker-end', function(d) { return 'url(#edge)'; })
			.attr("stroke", "#aaa")
			.attr("stroke-width", function(d) { return Math.sqrt(1); });

		var oldLink = link.exit();
		oldLink.remove();

		var node = _this.nodesGroup.selectAll('g')
			.data(_this.nodes, function(d, i) { return d.word; });

		var newNode = node.enter().append('g');

		newNode.call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended));

		newNode.append('text')
			.text(function(d) { return d.word; })
			.attr("fill", function(d) { return _this.color(/*d.group*/1); });

		//newNodes.append("title")
			//.text(function(d) { return d.word; });

		var oldNode = node.exit();
		oldNode.remove();

		_this.simulation = d3.forceSimulation()
			.force("link", d3.forceLink().id(function(d) { return d.word; }).distance(80))
			.force("charge", d3.forceManyBody()
					.strength(-300))
			.force("center", d3.forceCenter(_this.width / 2, _this.height / 2))

		_this.simulation
			.nodes(_this.nodes)
			.on("tick", ticked);

		_this.simulation.force("link")
			.links(_this.links);

		var allLink = link.merge(newLink);
		var allNode = node.merge(newNode);

		function ticked() {
			allLink.selectAll('line')
				.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });

			//newNode.selectAll('text')
				//.attr("x", function(d) { return d.x; })
				//.attr("y", function(d) { return d.y; });

			allNode
				.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
		}

		/*
		var edges = svg.append('g')
			.attr('class', 'edges')
			.selectAll('line')
			.data(graph.edges, function(d, i) { return d.source + ',' + d.target + ',' + d.value.poemId; });

		var newEdges = edges.enter().append('g');
		newEdges.append('line')
			.attr('marker-end', function(d) { return 'url(#edge)'; })
			.attr("stroke", "#aaa")
			.attr("stroke-width", function(d) { return Math.sqrt(1); });

		var oldEdges = edges.exit();
		oldEdges.remove();

		var nodes = svg.append("g")
			.attr("class", "nodes")
			.selectAll("g")
			.data(graph.words, function(d, i) { return d.word; });

		var newNodes = nodes.enter().append('g');
		newNodes.append('text')
			.text(function(d) { return d.word; })
			.attr("fill", function(d) { return color(*//*d.group*//*1); })
			.call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended));

		//newNodes.append("title")
			//.text(function(d) { return d.word; });

		var oldNodes = nodes.exit();
		oldNodes.remove();

		simulation
			.nodes(graph.words)
			.on("tick", ticked);

		simulation.force("link")
			.links(graph.edges);

		function ticked() {
			newEdges.selectAll('line')
				.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });

			newNodes.selectAll('text')
				.attr("x", function(d) { return d.x; })
				.attr("y", function(d) { return d.y; });

			//newNodes
				//.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
		}
		*/

		function dragstarted(d) {
			if (!d3.event.active) _this.simulation.alphaTarget(0.3).restart();
			d.fx = d.x;
			d.fy = d.y;
		}

		function dragged(d) {
			d.fx = d3.event.x;
			d.fy = d3.event.y;
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
	var socket = io.connect('/phrase-maze');
	socket.on('/words/directly-related', function(response) {
		console.log(response);
		graph = response.body;
		window.graphA = graph;
		console.log(graph);

		if(!pm) {
			pm = new PhraseMaze(graph.words, graph.edges);
			setTimeout(function() {
				//console.log('did it');
				//pm.nodes.pop();
				//while(pm.links.length > 1) {
					//pm.links.pop();
				//}
				//pm.update();
			}, 1000);
			//graph.words.forEach(function(w) {
				//pm.nodes.push(w);
			//});
			//graph.edges.forEach(function(e) {
				//pm.links.push(e);
			//});
			//pm.update();
			//graph.words.push({word: 'heyo' });

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
		}
		else {
			//if an entry in the new data also exists in the old data, we want the old version since it has the simulation data
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
			//pm.nodes = graph.words;
			//pm.links = graph.edges;
			var newNodes = pm.nodes.map(function(n) { return n;});
			//newNodes.push({word: 'hoooo'});
			var newLinks = pm.links.map(function(l) { return l;});
			newLinks.push({source: 'worldly', target: 'view', value: { poemId: 0 }});
			newLinks.push({source: 'view', target: 'one', value: { poemId: 0 }});
			newLinks.push({source: 'one', target: 'hello', value: { poemId: 0 }});
			newLinks.push({source: 'hello', target: 'war', value: { poemId: 0 }});
			pm.nodes = newNodes;
			pm.links = newLinks;
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
