import cytoscape from 'cytoscape';
import graphml from "cytoscape-graphml";
import tsv from "../../cytoscape-tsv.js";
import fcose from "cytoscape-fcose";
import coseBilkent from "cytoscape-cose-bilkent";
import cola from "cytoscape-cola";
import layvo from "cytoscape-layvo";
import layoutUtilities from "cytoscape-layout-utilities";
import $ from 'jquery';
import panzoom from 'cytoscape-panzoom';
import marll from 'cytoscape-marll';

import {evaluate} from './menu';
import {bindHover} from './hover';

cytoscape.use(graphml, $);
cytoscape.use(fcose);
cytoscape.use(coseBilkent);
cytoscape.use(cola);
cytoscape.use(tsv);
cytoscape.use(layvo);
cytoscape.use(layoutUtilities);
cytoscape.use(panzoom);
cytoscape.use(marll);

let cy, otherCy, cyId;
if (document.getElementById('cyLeft') && document.getElementById('cyRight')) {
	cyId = 'cyLeft';
} else {
	cyId = 'cy';
}

cy = window.cy = cytoscape({
	container: document.getElementById(cyId),
	ready: function(){
		this.layoutUtilities({
			componentSpacing: 30,
			desiredAspectRatio: $(this.container()).width()
			/ $(this.container()).height()});
	},
	style: [
		{
			selector: 'node',
			style: {
				'width': 20,
				'height': 20,
				'background-color': '#000000',
			}
		}, {
			selector: 'edge',
			style: {
				'line-color': '#757575',
				'opacity': 0.25,
			}
		}, {
			selector: 'node:selected',
			style: {
				'background-color': '#b71c1c'
			}
		}, {
			selector: 'edge:selected',
			style: {
				'line-color': '#b71c1c'
			}
		}, {
			selector: '.hover',
			style: {
				'background-color': '#b71c1c',
					'line-color': '#b71c1c'
			}
		}
	],
});

initCyInstance(cy);

if (document.getElementById('cyRight')) {
	otherCy = window.otherCy = cytoscape({
		container: document.getElementById('cyRight'),
		ready: function(){
			this.layoutUtilities({
				componentSpacing: 30,
				desiredAspectRatio: $(this.container()).width()
				/ $(this.container()).height()});
		},
		style: [
			{
				selector: 'node',
				style: {
					'width': 20,
					'height': 20,
					'background-color': '#000000',
				}
			}, {
				selector: 'edge',
				style: {
					'line-color': '#757575',
					'opacity': 0.25,
				}
			}, {
				selector: 'node:selected',
				style: {
					'background-color': '#b71c1c'
				}
			}, {
				selector: 'edge:selected',
				style: {
					'line-color': '#b71c1c'
				}
			}, {
				selector: '.hover',
				style: {
					'background-color': '#b71c1c',
					'line-color': '#b71c1c'
				}
			}
		],
	});

	initCyInstance(otherCy);
}

function initCyInstance(cy) {
	cy.panzoom();

	cy.on('layoutstart', () => {
		$('#spinner').removeClass('hide');
	});

	cy.on('layoutstop', () => {
		$('#spinner').addClass('hide');
	});
}

let toJson = obj => obj.json();

let applyDataset = dataset => {
	cy.elements().remove();
	cy.add( dataset );
	let startTime = performance.now();
	cy.layout({name: 'grid',
		stop: () => evaluate(performance.now() - startTime)
	}).run();

	if (otherCy) {
		otherCy.elements().remove();
		otherCy.add(JSON.parse(JSON.stringify(dataset)));
		startTime = performance.now();
		otherCy.layout({name: 'grid',
			stop: () => evaluate(performance.now() - startTime)
		}).run();
	}
}
fetch(`samples/sample1.json`).then( toJson ).then(applyDataset);

if (otherCy ) {
	bindHover(cy, otherCy);
	bindHover(otherCy, cy);
	cy.on('select', ele => {
		let otherEle = otherCy.$('#' + ele.target.id());
		if (otherEle && !otherEle.selected()) {
			otherEle.select();
		}
	});
	cy.on('unselect', ele => {
		let otherEle = otherCy.$('#' + ele.target.id());
		if (otherEle && otherEle.selected()) {
			otherEle.unselect();
		}
	});

	otherCy.on('select', ele => {
		let otherEle = cy.$('#' + ele.target.id());
		if (otherEle && !otherEle.selected()) {
			otherEle.select();
		}
	});
	otherCy.on('unselect', ele => {
		let otherEle = cy.$('#' + ele.target.id());
		if (otherEle && otherEle.selected()) {
			otherEle.unselect();
		}
	});
}
export {cy, otherCy};
