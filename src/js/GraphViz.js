import Viz from 'viz.js';
//import workerURL from 'viz.js/full.render.js';
import { Module, render } from 'viz.js/full.render.js';


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

	runLayout(layoutEngine = 'neato') {
		var digraph = this.getDigraph();
		this.viz.renderString(digraph, {engine: layoutEngine, format: 'json0'})
			.then(result => {
				let layout = JSON.parse(result);
				layout.objects.forEach(node => {
					let pos = node.pos.split(',');
					console.log( pos[0] + ', ' + pos[1]) 
					cy.$('#' + node.name).position({
						x: Number(pos[0]), y: Number(pos[1])
					});
				})

				cy.fit();
			})
		.then(() => cy.emit('layoutstop'));
	}
}

export {GraphViz};
