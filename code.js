var width = 1200
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
		.append("path")
			.attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5")
			.style("stroke", "#000")
			.style("opacity", "1")

	//Graphs nodes and links
	force
		.nodes(graph.nodes)
		.links(graph.links)
		.start()

	svg.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", 0)
		.attr("y2", 400)
		.style("stroke-width", 5)
		.style("stroke", "black")
	svg.append("line")
		.attr("x1", 0)
		.attr("y1", 400)
		.attr("x2", 200)
		.attr("y2", 400)
		.style("stroke-width", 5)
		.style("stroke", "black")
	svg.append("line")
		.attr("x1", 200)
		.attr("y1", 400)
		.attr("x2", 200)
		.attr("y2", 0)
		.style("stroke-width", 5)
		.style("stroke", "black")
	svg.append("line")
		.attr("x1", 200)
		.attr("y1", 0)
		.attr("x2", 0)
		.attr("y2", 0)
		.style("stroke-width", 5)
		.style("stroke", "black")

	svg.append("text")
		.text("Information")
		.attr("id", "line1")
		.attr("x", 25)
		.attr("y", 50)
		.style("font-weight", "bold")

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

	svg.append("text")
		.text("")
		.attr("id", "line5")
		.attr("x", 25)
		.attr("y", 150)

	// Set link attributes
	var link = svg.selectAll(".link")
	  .data(graph.links)
		.enter().append("g")
		.on("mouseover", function(d) {
			svg.selectAll("#line2").text("source: " + d.source.name)
			svg.selectAll("#line3").text("target: " + d.target.name)
			svg.selectAll("#line4").text("position: " + Math.round(d.position))
			svg.selectAll("#line5").text("cost: " + Math.round(d.cost))
		})
		.on("mouseout", function(d) {
			svg.selectAll("#line2").text("")
			svg.selectAll("#line3").text("")
			svg.selectAll("#line4").text("")
			svg.selectAll("#line5").text("")
		})

	link.append("line")
		.attr("class", "link")
		.style("stroke-width", function(d) {
			if (d.position == 0)
				return 1
			if (d.position < 1000000)
				return 2
			if (d.position < 10000000)
				return 3
			if (d.position < 100000000)
				return 4
		})
		.style("marker-end",  "url(#suit)")

	// Set nodes attributes
	var node = svg.selectAll(".node")
		.data(graph.nodes)
		.enter().append("g")
		.attr("class", "node")
		.on("mouseover", function(d) {
			d3.select(this).selectAll("circle")
				.style("fill", "#ff0000")
			svg.selectAll("#line2").text("name: " + d.name)
			svg.selectAll("#line3").text("position: " + Math.round(d.position))

		})
		.on("mouseout", function(d) {
			d3.select(this).selectAll("circle")
				.style("fill", color(d.group))
			svg.selectAll("#line2").text("")
			svg.selectAll("#line3").text("")
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
	d3.selectAll(".link")
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
		x: (data.x + 900) * 1000 / 2000,
		y: (data.y + 100) * 600 / 1300,
		position: totalPosition(node_positions[data.id]),
		id: data.id,
	}
}
