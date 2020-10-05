import Viz from 'viz.js';
//import workerURL from 'viz.js/full.render.js';
import { Module, render } from 'viz.js/full.render.js';
import { color } from 'd3';


class GraphViz {
	constructor() {
		this.viz = new Viz({Module, render});
	}

	getDigraph() {
		let digraph = 'digraph { node [shape=point,height=0.25];';

		cy.edges().forEach(e => {
			digraph += `${e.source().id()} -> ${e.target().id()};`;
		});

		digraph += '}';
		return digraph;
	}

	runLayout(cy, layoutEngine = 'neato') {
		var digraph = this.getDigraph();
		var color_dict = d3.scaleOrdinal(d3.schemeCategory10);
		var i=0;
		console.log(color_dict(i));
		this.viz.renderString(digraph, {start: 'rand', engine: layoutEngine, format: 'json0'})
			.then(result => {
				let layout = JSON.parse(result);
				layout.objects.forEach(node => {
					let pos = node.pos.split(',');
					cy.$('#' + node.name).position({
						x: Number(pos[0]), y: Number(pos[1])
					})//.style('background-color',color_dict(i));
					i+=1;
				})

				cy.fit(null, 50);
			})
		.then(() => cy.emit('layoutstop'));
	}
}

export {GraphViz};
