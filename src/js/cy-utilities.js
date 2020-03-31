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

import {evaluate} from './menu';

cytoscape.use(graphml, $);
cytoscape.use(fcose);
cytoscape.use(coseBilkent);
cytoscape.use(cola);
cytoscape.use(tsv);
cytoscape.use(layvo);
cytoscape.use(layoutUtilities);
cytoscape.use(panzoom);

let cy = window.cy = cytoscape({
  container: document.getElementById('cy'),
  ready: function(){
    this.layoutUtilities({componentSpacing: 30, desiredAspectRatio: $(this.container()).width() / $(this.container()).height()});
    this.nodes().forEach(function(node, i){
      let width = [30, 70, 110];
      let size = width[i%3];
      node.css("width", size);
      node.css("height", size);
    });
    let startTime;
    let endTime;
    startTime = performance.now();
    this.layout({name: "fcose", padding: 20}).run();
    endTime = performance.now();
    let graphProperties = this.layvo("get").generalProperties();
    document.getElementById("numOfNodes").innerHTML = this.nodes().length;
    document.getElementById("numOfEdges").innerHTML = this.edges().length;
    document.getElementById("layoutTime").innerHTML = Math.round((endTime - startTime) * 10 ) / 10 + " ms";
    document.getElementById("numberOfEdgeCrosses").innerHTML = graphProperties.numberOfEdgeCrosses;
    document.getElementById("numberOfNodeOverlaps").innerHTML = graphProperties.numberOfNodeOverlaps;
    document.getElementById("averageEdgeLength").innerHTML = Math.round(graphProperties.averageEdgeLength * 10 ) / 10;
    document.getElementById("totalArea").innerHTML = Math.round(graphProperties.totalArea * 10 ) / 10; 
  },
//  layout: {name: "fcose", tile:true},
  style: [
    {
      selector: 'node',
      style: {
        'background-color': '#6c757d',
      }
    },
    {
      selector: 'node:parent',
      style: {
        "border-width": 3,
        'background-opacity': 0.333,
        'background-color': '#6c757d',
        'border-color': '#6c757d'
      }
    },    
    {
      selector: 'edge',
      style: {
        'line-color': '#6c757d'
      }
    },
    {
      selector: 'node:selected',
      style: {
        'background-color': '#dc3545'
      }
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': '#dc3545'
      }
    }
  ],
});

cy.panzoom();

    let toJson = obj => obj.json();

    let applyDataset = dataset => {
      // so new eles are offscreen

      // replace eles
      cy.elements().remove();
      cy.add( dataset );
		cy.fit();
    }
 fetch(`samples/sample1.json`).then( toJson ).then(applyDataset);
export {cy};
