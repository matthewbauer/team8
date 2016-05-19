var width = 960
var height = 500
var linkDistance = 200
var nodeRadius = 20

function main() {
	var graph = {
		nodes: data_nodes.map(toNode),
		links: data_edges.map(toLink),
	}

	var color = d3.scale.category20()

	// Force layout
	var force = d3.layout.force()
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
		.style("stroke", "#4679BD")
		.style("opacity", "0.6")

	force
		  .nodes(graph.nodes)
		  .links(graph.links)
			.start()

	// Set link attributes
	var link = svg.selectAll(".link")
		  .data(graph.links)
		.enter().append("line")
		  .attr("class", "link")
		  .style("stroke-width", function(d) { return d.value })
		  .style("marker-end",  "url(#suit)")

	// Set nodes attributes
	var node = svg.selectAll(".node")
		.data(graph.nodes)
		.enter().append("g")
		.attr("class", "node")

	node.append("circle")
		.attr("r", nodeRadius)
		.style("fill", function (d) { return color(d.group) })

	node.append("text")
		.attr("dx", 12)
		.attr("dy", ".35em")
		.text(function(d) { return d.name })
		.style("stroke", "gray")

	force.on("tick", function () {
		link.attr("x1", function (d) { return d.source.x })
			.attr("y1", function (d) { return d.source.y })
			.attr("x2", function (d) { return d.target.x })
			.attr("y2", function (d) { return d.target.y })
		d3.selectAll("circle").attr("cx", function (d) { return d.x })
			.attr("cy", function (d) { return d.y })
		d3.selectAll("text").attr("x", function (d) { return d.x })
			.attr("y", function (d) { return d.y })
	})
}

function toLink(edge) {
	return {
		source: edge.fromNodeId,
		target: edge.toNodeId,
		value: 1,
	}
}

function toNode(data) {
	return {
		name: data.name,
		group: 1,
	}
}
