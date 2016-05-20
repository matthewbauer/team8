var width = window.innerWidth - 10
var height = window.innerHeight - 10
var linkDistance = 200
var nodeRadius = 20


function toMap(map, key) {
	var out = {}
	for (var k in map) {
		out[map[k][key]] = map[k]
	}
	return out
}


function toMapArray(map, key) {
	var out = {}
	for (var k in map) {
		if (!(map[k][key] in out))
			out[map[k][key]] = []
		out[map[k][key]].push(map[k])
	}
	return out
}

//declare instruments
var instruments = toMap(data_instruments, 'id')
//declare edges
var edges = toMapArray(data_edge_positions, 'edgeId')

//Obtains the position of the price difference and sends it
function totalPosition(ns) {
	return ns.map(function(instrument) {
		return instrument.qty * instruments[instrument.instrumentId].price
	}).reduce(function(a, b) {
		return a + b
	}, 0)
}

function totalCost(ns) {
	return ns.map(function(n) {
		return data_edge_cost.find(function(x) {
			return x.instrumentId == n.instrumentId && x.edgeId == n.edgeId
		}).cost
	}).reduce(function(a, b) {
		return a + b
	}, 0)
}

function main() {
	var graph = {
		nodes: data_nodes.map(toNode),
		links: data_edges.map(toLink),
	}

	var color = d3.scale.category20()

	// Force layout
	var force = d3.layout.force()
		//This doesn't do much
		.charge(-120)
		.linkDistance(linkDistance)
		.size([width, height])

	var svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height)

	// Arrow marker
	svg.append("defs").selectAll("marker")
		.data(["suit", "licensing", "resolved"])
	  .enter().append("marker")
		.attr("id", function(d) { return d })
		.attr("viewBox", "0 -5 10 10")
		.attr("refX", 27)
		.attr("refY", 0)
		.attr("markerWidth", 12)
		.attr("markerHeight", 12)
		.attr("orient", "auto")

	//Graphs nodes and links
	force
		.nodes(graph.nodes)
		.links(graph.links)
		.start()

	// Set link attributes
	var link = svg.selectAll(".link")
	  .data(graph.links)
		.enter().append("g")

	link.append("line")
		.attr("class", "link")
		.style("stroke-width", 10)
		.style("marker-end",  "url(#suit)")

	link.append("text")
		.attr("dx", 12)
		.attr("dy", ".35em")
		.text(function(d) { return d.position })
		.style("stroke", "black")
		.attr("class", "linelabel")
		.style("visibility", "visible")

	link.append("text")
		.attr("dx", 12)
		.attr("dy", ".35em")
		.text(function(d) { return d.cost })
		.style("stroke", "black")
		.attr("class", "linecost")

	// Set nodes attributes
	var node = svg.selectAll(".node")
		.data(graph.nodes)
		.enter().append("g")
		.attr("class", "node")
		.on("mouseover", function(d) {
			d3.select(this).selectAll("text").style("visibility", "visible")
			.style("fill", function (d) { return "#ff0000" })
		})
		.on("mouseout", function(d) {
			d3.select(this).selectAll("text").style("visibility", "hidden")
		})

	//Appends node circle
	node.append("circle")
		.attr("r", nodeRadius)
		.style("fill", function (d) { return color(d.group) })

	//Appends node text
	node.append("text")
		.attr("dx", 12)
		.attr("dy", ".35em")
		.text(function(d) { return d.name })
		.style("stroke", "gray")
		.attr("class", "name")
		.style("visibility", "hidden")

	//Draws all the lines
	d3.selectAll("line")
		.attr("x1", function (d) { return d.source.x })
		.attr("y1", function (d) { return d.source.y })
		.attr("x2", function (d) { return d.target.x })
		.attr("y2", function (d) { return d.target.y })

	//Draws labels for the lines
	d3.selectAll(".linelabel")
		.attr("x", function (d) { return (d.source.x + d.target.x) / 2 })
		.attr("y", function (d) { return (d.source.y + d.target.y) / 2 })

	d3.selectAll(".linecost")
		.attr("x", function (d) { return (d.source.x + d.target.x) / 2 })
		.attr("y", function (d) { return (d.source.y + d.target.y) / 2 + 24 })

	//Draw the circles for the nodes
	d3.selectAll("circle")
		.attr("cx", function (d) { return d.x })
		.attr("cy", function (d) { return d.y })

	//Shows the name of the nodes
	d3.selectAll(".name")
		.attr("x", function (d) { return d.x })
		.attr("y", function (d) { return d.y })
}

function toLink(edge) {
	return {
		source: edge.fromNodeId,
		target: edge.toNodeId,
		id: edge.id,
		position: totalPosition(edges[edge.id]),
		cost: totalCost(edges[edge.id]),
	}
}

function toNode(data) {
	return {
		name: data.name,
		group: 1,
		x: (data.x + 500) * width / 2000,
		y: (data.y + 100) * height / 1300,
	}
}
