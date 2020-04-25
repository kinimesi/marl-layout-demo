import $ from 'jquery';
import 'bootstrap';
import {cy, otherCy} from './cy-utilities';
import { saveAs } from 'file-saver';
import {GraphViz} from './GraphViz';

var graphViz = new GraphViz();

$("body").on("change", "#inputFile", function(e, fileObject) {
	var inputFile = this.files[0] || fileObject;

	if (inputFile) {
		var fileExtension = inputFile.name.split('.').pop();
		var r = new FileReader();
		r.onload = function(e) {
			cy.remove(cy.elements());
			if (otherCy) {
				otherCy.elements().remove();
			}
			var content = e.target.result;
			if(fileExtension == "graphml" || fileExtension == "xml"){
				cy.graphml({layoutBy: 'null'});
				cy.graphml(content);
				if (otherCy) {
					otherCy.graphml({layoutBy: 'null'});
					otherCy.graphml(content);
				}
			}
			else if (fileExtension == "json") {
				cy.add(JSON.parse(content))
				if (otherCy) {
					otherCy.add(JSON.parse(content))
				}
			}
			else{
				var tsv = cy.tsv();
				tsv.importTo(content);        
				if (otherCy) {
					tsv = otherCy.tsv();
					tsv.importTo(content);        
				}
			}
		};
		r.addEventListener('loadend', function(){
			if(!fileObject)
				return;
			//document.getElementById("fileName").innerHTML = inputFile.name;

			//$("#runLayout").trigger("click");
			cy.layout({'name': 'grid'}).run();
			if (otherCy) {
				otherCy.layout({'name': 'grid'}).run();
			}
			evaluate(0);
		});
		r.readAsText(inputFile);
	} else { 
		alert("Failed to load file");
	}
	$("#inputFile").val(null);
});

document.getElementById("openFile").addEventListener("click", function(){
  document.getElementById("inputFile").click();
});

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

document.getElementById("saveFile").addEventListener("click", function(){
  let graphString = cy.graphml();
  download('graph.graphml', graphString);
});

document.getElementById("saveJPG").addEventListener("click", function(){
  let jpgContent = cy.jpg({output: "blob", maxHeight: 600, maxWidth: 600, quality: 1, full: true});
  saveAs(jpgContent, "graph.jpg");
});

function evaluate(layoutTime){
	let findNumberOfOverlappingNodes = function(cy) {
		let boundingBox = function(node) {
			let pos = node.position();
			let wHalf = node.outerWidth() / 2;
			let hHalf = node.outerHeight() / 2;
			return {x1: pos.x - wHalf, y1: pos.y - hHalf,
				x2: pos.x + wHalf, y2: pos.y + hHalf};
		}
		let doesOverlap = function(node, otherNode) {
			let bb = boundingBox(node), bbOther = boundingBox(otherNode);
			return !(bbOther.x1 > bb.x2 || bbOther.x2 < bb.x1
				|| bbOther.y1 > bb.y2 || bbOther.y2 < bb.y1);
		};

		let overlaps = 0;
		let nodeArray = cy.nodes().toArray();

		for (let i = 0; i < nodeArray.length; i++) {
			let node = nodeArray[i];
			for (let j = i + 1; j < nodeArray.length; j++) {
				let otherNode = nodeArray[j];
				if (doesOverlap(node, otherNode)) {
					overlaps++;
				}
			}
		}
		return overlaps;
	};
	let graphProperties = cy.layvo("get").generalProperties();
	graphProperties.numberOfNodeOverlaps = findNumberOfOverlappingNodes(cy);
	document.getElementById("numOfNodes").innerHTML = cy.nodes().length;
	document.getElementById("numOfEdges").innerHTML = cy.edges().length;
	document.getElementById("layoutTime").innerHTML
		= Math.round(layoutTime * 10 ) / 10; 
	document.getElementById("numberOfEdgeCrosses").innerHTML
		= graphProperties.numberOfEdgeCrosses;
	document.getElementById("numberOfNodeOverlaps").innerHTML
		= graphProperties.numberOfNodeOverlaps;
	document.getElementById("averageEdgeLength").innerHTML
		= Math.round(graphProperties.averageEdgeLength * 10 ) / 10;
	document.getElementById("totalArea").innerHTML
		= Math.round(graphProperties.totalArea * 10 ) / 10;


	if (otherCy) {
		graphProperties = otherCy.layvo("get").generalProperties();
		graphProperties.numberOfNodeOverlaps = findNumberOfOverlappingNodes(otherCy);
		document.getElementById("otherNumOfNodes").innerHTML = otherCy.nodes().length;
		document.getElementById("otherNumOfEdges").innerHTML = otherCy.edges().length;
		document.getElementById("otherLayoutTime").innerHTML
			= Math.round(layoutTime * 10 ) / 10; 
		document.getElementById("otherNumberOfEdgeCrosses").innerHTML
			= graphProperties.numberOfEdgeCrosses;
		document.getElementById("otherNumberOfNodeOverlaps").innerHTML
			= graphProperties.numberOfNodeOverlaps;
		document.getElementById("otherAverageEdgeLength").innerHTML
			= Math.round(graphProperties.averageEdgeLength * 10 ) / 10;
		document.getElementById("otherTotalArea").innerHTML
			= Math.round(graphProperties.totalArea * 10 ) / 10;
	}
}

var layout;
var otherLayout;
$("body").on("click", "#runLayout", function(){
	$('#spinner').removeClass('hide');

	let layoutType = document.getElementById("layout").value;
	layout = runLayout(cy, layoutType);
});
$("body").on("click", "#runOtherLayout", function(){
	$('#spinner').removeClass('hide');

	let layoutType = document.getElementById("otherLayout").value;
	otherLayout = runLayout(otherCy, layoutType);
});


$("body").on("click", "#stopLayout", function(){
	if (layout) {
		layout.stop();
		layout = null;
	}
});
$("body").on("click", "#stopOtherLayout", function(){
	if (otherLayout) {
		otherLayout.stop();
		otherLayout = null;
	}
});
function runLayout(cy, layoutType) {
	let quality = 'default';//$("#quality").find("option:selected").text();
	let randomize = document.getElementById('randomize').value == 'Random';
	let numIter = document.getElementById("numIter").value;
	let repulsionConstant = document.getElementById("repulsionConstant").value;
	let edgeElasticity = document.getElementById("edgeElasticity").value;
	if (document.getElementById('randomize').value == 'Grid') {
	  cy.layout({'name': 'grid'}).run();
	}

	let startTime;
	let endTime;
	let layout;

	if (layoutType == "FD"){
		startTime = performance.now();
		layout = cy.layout({name: "cose-bilkent", padding: 20,
			quality:quality, randomize: randomize, animationDuration: 1000,
			stop: () => {
				endTime = performance.now();
				evaluate(endTime - startTime);
			}});
	} else if(layoutType == "MARL FD"){
		startTime = performance.now();
		layout = cy.layout({name: "marll", randomize: randomize,
			nodeRepulsion: repulsionConstant,
			edgeElasticity: edgeElasticity, refresh: 15,
			maxIterations: numIter, animate: true,
			stop: () => {
				endTime = performance.now();
				evaluate(endTime - startTime);
			},
		});
	} else if(layoutType == "MARL FR"){
		startTime = performance.now();
		layout = cy.layout({name: "marll", randomize: randomize,
			nodeRepulsion: repulsionConstant,
			edgeElasticity: edgeElasticity, refresh: 15,
			maxIterations: numIter, animate: true,
			rewardFunction: 'forceDirectedFR',
			idealEdgeLength: 40,
			stop: () => {
				endTime = performance.now();
				evaluate(endTime - startTime);
			},
		});
	} else if(layoutType == "MARL Incremental"){
		startTime = performance.now();
		layout = cy.layout({name: "marll", randomize: randomize,
			nodeRepulsion: repulsionConstant,
			edgeElasticity: edgeElasticity, refresh: 15,
			maxIterations: numIter, animate: true,
			rewardFunction: 'localStress',
			incremental: true,
			stop: () => {
				endTime = performance.now();
				evaluate(endTime - startTime);
			},
		});
	}
	else if(layoutType == "MARL Local Stress"){
		let maxDistance = Number(document.getElementById("maxDistance").value);
		startTime = performance.now();
		layout = cy.layout({name: "marll", randomize: randomize,
			maxIterations: numIter, animate: true,
			rewardFunction: 'localStress',
			maxDistance: maxDistance,
			stop: () => {
				endTime = performance.now();
				evaluate(endTime - startTime);
			},
		});
	} else if(layoutType == "MARL Global Stress"){
		startTime = performance.now();
		layout = cy.layout({name: "marll", randomize: randomize,
			maxIterations: numIter, animate: true,
			rewardFunction: 'globalStress',
			stop: () => {
				endTime = performance.now();
				evaluate(endTime - startTime);
			},
		});
	} else if(layoutType == "MARL Custom Reward"){
		startTime = performance.now();
		layout = cy.layout({name: "marll", randomize: randomize,
			maxIterations: numIter, animate: true,
			rewardFunction: 'customReward',
			stop: () => {
				endTime = performance.now();
				evaluate(endTime - startTime);
			},
		});
	} else if(layoutType == "SM"){
		startTime = performance.now();
		graphViz.runLayout(cy);
		cy.one('layoutstop', () => {
			endTime = performance.now();
			evaluate(endTime - startTime);
		});
	} else if(layoutType == "FDP"){
		startTime = performance.now();
		graphViz.runLayout(cy, 'fdp');
		cy.one('layoutstop', () => {
			endTime = performance.now();
			evaluate(endTime - startTime);
		});
	} else {
		startTime = performance.now();
		cy.layout({name: "random", padding: 20}).run();
		endTime = performance.now();
		evaluate(endTime - startTime);    
	}

	layout.run();
	return layout;
};

function loadXMLDoc(fileName) {
	var xhttp;
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    }
    else // for IE 5/6
    {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET", fileName, false);
    xhttp.send();
    return xhttp.response;
}

function loadSample(fileName){
	var xmlResponse = loadXMLDoc(fileName);

	var fileObj = new File([xmlResponse], fileName, {
		type: "text/plain"
	});

	return fileObj;
}

$("body").on("change", "#samples", function() {
	let samples = document.getElementById("samples");
	let graph = loadSample("samples/"+samples.value);
	$("#inputFile").trigger("change", [graph]);
  //document.getElementById("fileName").innerHTML = samples.options[samples.selectedIndex].text + ".json";
});

$( document ).keydown(function( event ) {
	let keycode = (event.keyCode ? event.keyCode : event.which);
	if (keycode == 78) {
		event.preventDefault();
		cy.add({
			group: 'nodes'
		});
	} else if (keycode == 69)  {
		event.preventDefault();
		if(cy.nodes(":selected").length == 2)
			cy.add({group: 'edges', data: {
				source: cy.nodes(":selected")[0].data("id"),
				target: cy.nodes(":selected")[1].data("id")}
			});
	} else if ( keycode == 46 ) {
		event.preventDefault();
		cy.elements(":selected").remove();
	} else if ( keycode == 76 ) {
		event.preventDefault();
		$("#runLayout").trigger("click");
	}
});

export {evaluate};
