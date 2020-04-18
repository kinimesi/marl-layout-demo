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

cytoscape.use(graphml, $);
cytoscape.use(fcose);
cytoscape.use(coseBilkent);
cytoscape.use(cola);
cytoscape.use(tsv);
cytoscape.use(layvo);
cytoscape.use(layoutUtilities);
cytoscape.use(panzoom);
cytoscape.use(marll);

let cy = window.cy = cytoscape({
	container: document.getElementById('cy'),
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
				'background-color': '#07575B',
			}
		}, {
			selector: 'edge',
			style: {
				'line-color': '#66A5AD',
				'opacity': 0.25,
			}
		}, {
			selector: 'node:selected',
			style: {
				'background-color': '#dc3545'
			}
		}, {
			selector: 'edge:selected',
			style: {
				'line-color': '#dc3545'
			}
		}
	],
});

cy.panzoom();
cy.on('layoutstart', () => {
	$('#spinner').removeClass('hide');
})
cy.on('layoutstop', () => {
	$('#spinner').addClass('hide');
})

let toJson = obj => obj.json();

let applyDataset = dataset => {
	cy.elements().remove();
	cy.add( dataset );
	let startTime = performance.now();
	cy.layout({name: 'grid',
		stop: () => evaluate(performance.now() - startTime)
	}).run();
}
fetch(`samples/sample1.json`).then( toJson ).then(applyDataset);
export {cy};
