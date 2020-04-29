import $ from "jquery";


const storeStyle = (ele, keys) => {
  const storedStyleProps = {};

  for (let key of keys) {
    storedStyleProps[key] = ele.style(key);
  }

  return storedStyleProps;
};
// taken from: https://stackoverflow.com/a/13542669
function shadeColor(color, percent) {
	var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
	return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}


const dynamicScalingfactors = (zoom) => {
  const scalingFactor = ( 1 / zoom );
  const defaults = {
    fontSize: 40,
    outlineWidth: 4,
    arrowScale: 3,
    edgeWidth: 3,
  };

  const dynamicFontSize = Math.min(defaults.fontSize, Math.max(scalingFactor * 20, 20));
  const dynamicFontOutlineWidth = Math.min(defaults.outlineWidth, Math.max(scalingFactor * 3, 3));
  const dynamicArrowScale = Math.min(defaults.arrowScale, Math.max(scalingFactor * 2.5, 2.5));
  const dynamicEdgewidth = Math.min(defaults.edgeWidth, Math.max(scalingFactor * 3, 3));

  return {
    fontSize: dynamicFontSize,
    outlineWidth: dynamicFontOutlineWidth,
    arrowScale: dynamicArrowScale,
    edgeWidth: dynamicEdgewidth
  };
};

const applyHoverStyle = (cy, cyR, eles, style) => {
  const stylePropNames = Object.keys(style);
  
  eles.forEach((ele) => {
	var ele2 = cyR.getElementById(ele.id());
    if (ele2.length){
		ele.scratch('_hover-style-before', storeStyle(ele, stylePropNames));
		ele2.scratch('_hover-style-before', storeStyle(ele2, stylePropNames));
		ele.style(style);
		ele2.style(style);
		ele2.addClass('hover');
	}
  });
	eles.addClass('hover');
  
};

const removeHoverStyle = (cy, cyR, eles) => {

	eles.removeClass('hover');
	cyR.elements().removeClass('hover');
  cy.batch(function () {
    eles.forEach((ele) => {
      ele.style(ele.scratch('_hover-style-before'));
      ele.removeScratch('_hover-style-before');
	var ele2 = cyR.getElementById(ele.id());
	if (ele2.length){
      ele2.style(ele2.scratch('_hover-style-before'));
      ele2.removeScratch('_hover-style-before');
	}
    });
  });
};

const scaledDimensions = (node, zoom) => {
  const nw = node.width();
  const nh = node.height();

  if (nw === 0 || nh === 0) { return { w: 0, h: 0};}

  const scaledVal = (1 / zoom) * 8;
  const aspectRatio = nw / nh;
  let xIncr = 0;
  let yIncr = 0;

  if (aspectRatio > 1) {
    xIncr = nw + scaledVal;
    yIncr = nh + (scaledVal / aspectRatio);
  } else {
    xIncr = nw + (scaledVal / aspectRatio);
    yIncr = nh + scaledVal;
  }

  return {
    w: xIncr,
    h: yIncr
  };
};



const baseNodeHoverStyle =  {
  'z-compound-depth': 'top',
  'color': 'white',
  'text-outline-color': 'black'
};

const baseEdgeHoverStyle = {
};

const bindHover = (cy, cyR) => {
  cy.on('mouseover', 'node[class!="compartment"]', function (evt) {
    const node = evt.target;
    const currZoom = cy.zoom();

    const { fontSize, outlineWidth, arrowScale, edgeWidth } = dynamicScalingfactors(currZoom);

    node.neighborhood().nodes().union(node).not(node).forEach((node) => {
      const { w, h } = scaledDimensions(node, currZoom);

      const nodeHoverStyle = $.extend(true,baseNodeHoverStyle, {
        'font-size': fontSize,
        'text-outline-width': outlineWidth,
        'width': w,
        'height': h
      });

      applyHoverStyle(cy, cyR, node, nodeHoverStyle);
    });

      const { w, h } = scaledDimensions(node, currZoom);
      const nodeHoverStyle = $.extend(true, {}, baseNodeHoverStyle, {
        'font-size': fontSize,
        'text-outline-width': outlineWidth,
        'width': w,
        'height': h,
      });
      applyHoverStyle(cy, cyR, node, nodeHoverStyle);

    const edgeHoverStyle = $.extend(true,baseEdgeHoverStyle, {
      'arrow-scale': arrowScale,
      'width': edgeWidth
    });

    applyHoverStyle(cy, cyR, node.neighborhood().edges(), edgeHoverStyle);
  });

  cy.on('mouseout cxttapend', 'node[class!="compartment"]', function (evt) {
    const node = evt.target;
    const neighborhood = node.neighborhood();

    removeHoverStyle(cy, cyR, neighborhood.nodes());
    removeHoverStyle(cy, cyR, node);
    removeHoverStyle(cy, cyR, neighborhood.edges());
  });

  cy.on('mouseover', 'edge', function (evt) {
    const edge = evt.target;
    const currZoom = cy.zoom();

    const { fontSize, outlineWidth, arrowScale, edgeWidth } = dynamicScalingfactors(currZoom);

    const edgeHoverStyle = $.extend(true, baseEdgeHoverStyle, {
      'arrow-scale': arrowScale,
      'width': edgeWidth
    });
    applyHoverStyle(cy, cyR, edge, edgeHoverStyle);


    edge.source().union(edge.target()).forEach((node) => {
      const { w, h } = scaledDimensions(node, currZoom);
      const nodeHoverStyle = $.extend(true, {}, baseNodeHoverStyle, {
        'width': w,
        'height': h,
        'font-size': fontSize,
        'color': 'white',
        'text-outline-color': 'black',
        'text-outline-width': outlineWidth,
        'opacity': 1,
        'z-compound-depth': 'top'
      });
      applyHoverStyle(cy, cyR, node, nodeHoverStyle);
    });
  });

  cy.on('mouseout cxttapend', 'edge', function (evt) {
    const edge = evt.target;

    removeHoverStyle(cy, cyR, edge);
    removeHoverStyle(cy, cyR, edge.source());
    removeHoverStyle(cy, cyR, edge.target());
  });
};


export {bindHover, shadeColor};
