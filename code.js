var width = 800
var height = 600
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
var edge_positions = toMapArray(data_edge_positions, 'edgeId')
//declare nodes
var node_positions = toMapArray(data_node_positions, 'nodeId')

//Obtains the position of the price difference and sends it
function totalPosition(ns) {
	if (!ns)
		return 0
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

	svg.append("text")
		.text("")
		.attr("id", "line1")
		.attr("x", 25)
		.attr("y", 50)

	svg.append("text")
		.text("")
		.attr("id", "line2")
		.attr("x", 25)
		.attr("y", 75)

	svg.append("text")
		.text("")
		.attr("id", "line3")
		.attr("x", 25)
		.attr("y", 100)

	svg.append("text")
		.text("")
		.attr("id", "line4")
		.attr("x", 25)
		.attr("y", 125)

	// Set link attributes
	var link = svg.selectAll(".link")
	  .data(graph.links)
		.enter().append("g")
		.on("mouseover", function(d) {
			svg.selectAll("#line1").text("source: " + d.source.name)
			svg.selectAll("#line2").text("target: " + d.target.name)
			svg.selectAll("#line3").text("position: " + Math.round(d.position))
			svg.selectAll("#line4").text("cost: " + Math.round(d.cost))
		})
		.on("mouseout", function(d) {
			svg.selectAll("#line1").text("")
			svg.selectAll("#line2").text("")
			svg.selectAll("#line3").text("")
			svg.selectAll("#line4").text("")
		})

	link.append("line")
		.attr("class", "link")
		.style("stroke-width", 10)
		.style("marker-end",  "url(#suit)")

	// Set nodes attributes
	var node = svg.selectAll(".node")
		.data(graph.nodes)
		.enter().append("g")
		.attr("class", "node")
		.on("mouseover", function(d) {
			svg.selectAll("#line1").text("name: " + d.name)
			svg.selectAll("#line2").text("position: " + Math.round(d.position))
		})
		.on("mouseout", function(d) {
			svg.selectAll("#line1").text("")
			svg.selectAll("#line2").text("")
		})
		.style("visibility", function(d) {
			if (d.id == 26)
				return "hidden"
			else
				return "visible"
		})

	//Appends node circle
	node.append("circle")
		.attr("r", nodeRadius)
		.style("fill", function(d) { return color(d.group) })

	//Draws all the lines
	d3.selectAll("line")
		.attr("x1", function(d) { return d.source.x })
		.attr("y1", function(d) { return d.source.y })
		.attr("x2", function(d) { return d.target.x })
		.attr("y2", function(d) { return d.target.y })

	//Draw the circles for the nodes
	d3.selectAll("circle")
		.attr("cx", function(d) { return d.x })
		.attr("cy", function(d) { return d.y })
}

function toLink(edge) {
	return {
		source: edge.fromNodeId,
		target: edge.toNodeId,
		id: edge.id,
		position: totalPosition(edge_positions[edge.id]),
		cost: totalCost(edge_positions[edge.id]),
	}
}

function toNode(data) {
	return {
		name: data.name,
		group: 1,
		x: (data.x + 500) * width / 2000,
		y: (data.y + 100) * height / 1300,
		position: totalPosition(node_positions[data.id]),
		id: data.id,
	}
}
