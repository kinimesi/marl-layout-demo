function getQualityScore(cy, idealEdgeLength) {
	var generalMetrics = cy.layvo().generalProperties();

	function possibleCrossings() {
		let all = cy.edges().length * (cy.edges().length - 1) / 2;
		let impossible = 0;
		cy.nodes().forEach(n => {
			impossible += n.degree() * (n.degree() - 1) / 2;
		})
		let possible = all - impossible;
		return possible;
	}

	let crossings = possibleCrossings();

	function getEdgeLengthVariance(idealEdgeLength) {
		var edges = cy.edges();
		var variance = 0;
		var generalMetrics = cy.layvo().generalProperties();
		var meanEdgeLength = idealEdgeLength || generalMetrics.averageEdgeLength;
		if (!meanEdgeLength) {
			return 0;
		};

		for (var i = 0; i < edges.length; i++) {
			let edge = edges[i]
			var sourcePos = edge.source().position();
			var targetPos = edge.target().position();
			var lengthX = targetPos.x - sourcePos.x;
			var lengthY = targetPos.y - sourcePos.y;

			length = Math.sqrt(lengthX * lengthX + lengthY * lengthY);
			//variance += ((length - idealEdgeLength)/idealEdgeLength) ** 2;
			variance += calcEdgeLengthVariance(edge, meanEdgeLength);
		}
		return variance / edges.length;
	}

	function calcEdgeLengthVariance(edge, idealEdgeLength) {
		var sourcePos = edge.source().position();
		var targetPos = edge.target().position();
		var lengthX = targetPos.x - sourcePos.x;
		var lengthY = targetPos.y - sourcePos.y;

		length = Math.sqrt(lengthX * lengthX + lengthY * lengthY);
		return ((length - idealEdgeLength)/idealEdgeLength) ** 2;
	}


	function calcAngle(n,c,m) {
		let nScrath = n.position();
		let mScrath = m.position();
		let cScrath = c.position();
		let ndy = nScrath.y - cScrath.y, ndx = nScrath.x - cScrath.x;
		let mdy = mScrath.y - cScrath.y, mdx = mScrath.x - cScrath.x;
		let na = Math.atan2(ndy, ndx)
		let ma =  Math.atan2(mdy, mdx);

		let da = Math.abs(na - ma);
		da = da < Math.PI ? da : 2 * Math.PI - da;

		return da
	}

	function calcDegree(node, center) {
		let nScrath = node.position();
		let cScrath = center.position();
		return Math.atan2(nScrath.y - cScrath.y, nScrath.x - cScrath.x);
	}
	function getAngleVariance() {
		var variance = 0;

		cy.nodes().forEach(n => {
			var arr = n.neighbourhood('node').toArray();
			if (arr.length > 1) {
				arr.sort((a, b) => calcDegree(a, n) - calcDegree(b, n));
				var length = arr.length;
				var minAngle = 2 * Math.PI;
				var angle;
				for (let i = 0; i < length - 1; i++) {
					angle = Math.abs(calcAngle(arr[i], n, arr[i+1]));
					if (angle < minAngle) {
						minAngle = angle;
					}
				}

				angle = Math.abs(calcAngle(arr[length - 1], n, arr[0]))
				if (angle < minAngle) {
					minAngle = angle;
				}
				let idealAngle = 2 * Math.PI / length;
				variance += Math.abs((idealAngle - minAngle) / idealAngle);
			}
		})
		return variance / cy.nodes().length;
	}

	var nc = 1 - (crossings ? generalMetrics.numberOfEdgeCrosses / crossings : 0);
	var l = cy.nodes().length;
	var no = 1 - generalMetrics.numberOfNodeOverlaps / (l * (l - 1) * 0.5);
	var ne = 1 / (1 + getEdgeLengthVariance(idealEdgeLength));
	var na = 1 - getAngleVariance();
	var metrics = {'nc': nc, 'no': no, 'ne': ne, 'na': na};
	return metrics;
}

export {getQualityScore};
