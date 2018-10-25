/**
 * Program starts here. The document.onLoad executes the
 * createEditor function with a given configuration.
 * In the config file, the mxEditor.onInit method is
 * overridden to invoke this global function as the
 * last step in the editor constructor.
 * 
 * @param {*} editor 
 */
function onInit(editor) {
    // Sets constants for touch style
    mxConstants.HANDLE_SIZE = 16;
    mxConstants.LABEL_HANDLE_SIZE = 7;

        // Enables managing of sizers
        mxVertexHandler.prototype.manageSizers = true;

        // Enables live preview
        mxVertexHandler.prototype.livePreview = true;

        // Larger tolerance and grid for real touch devices
        if (mxClient.IS_TOUCH || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
            mxShape.prototype.svgStrokeTolerance = 18;
            mxVertexHandler.prototype.tolerance = 12;
            mxEdgeHandler.prototype.tolerance = 12;
            mxGraph.prototype.tolerance = 12;
        }
        
        // One finger pans (no rubberband selection) must start regardless of mouse button
        mxPanningHandler.prototype.isPanningTrigger = function(me) {
            var evt = me.getEvent();
            
            return (me.getState() == null && !mxEvent.isMouseEvent(evt)) ||
                (mxEvent.isPopupTrigger(evt) && (me.getState() == null ||
                mxEvent.isControlDown(evt) || mxEvent.isShiftDown(evt)));
        };

        // Don't clear selection if multiple cells selected
        var graphHandlerMouseDown = mxGraphHandler.prototype.mouseDown;

        mxGraphHandler.prototype.mouseDown = function(sender, me) {
            graphHandlerMouseDown.apply(this, arguments);

            if (this.graph.isCellSelected(me.getCell()) && this.graph.getSelectionCount() > 1) {
                this.delayedSelection = false;
            }
        };

        // On connect the target is selected and we clone the cell of the preview edge for insert
        mxConnectionHandler.prototype.selectCells = function(edge, target) {
            if (target != null) {
                this.graph.setSelectionCell(target);
            }
            else {
                this.graph.setSelectionCell(edge);
            }
        };

        // Overrides double click handling to use the tolerance
        var graphDblClick = mxGraph.prototype.dblClick;

        mxGraph.prototype.dblClick = function(evt, cell) {
            if (cell == null) {
                var pt = mxUtils.convertPoint(this.container, mxEvent.getClientX(evt), mxEvent.getClientY(evt));
                cell = this.getCellAt(pt.x, pt.y);
            }

            graphDblClick.call(this, evt, cell);
        };

        var vertexHandlerHideSizers = mxVertexHandler.prototype.hideSizers;

        mxVertexHandler.prototype.hideSizers = function() {
            vertexHandlerHideSizers.apply(this, arguments);
            
            if (this.connectorImg != null) {
                this.connectorImg.style.visibility = 'hidden';
            }
    
            if (this.removeImg != null) {
                this.removeImg.style.visibility = 'hidden';
            }
        };
        
        var vertexHandlerReset = mxVertexHandler.prototype.reset;
    
        mxVertexHandler.prototype.reset = function() {
            vertexHandlerReset.apply(this, arguments);
            
            if (this.connectorImg != null) {
                this.connectorImg.style.visibility = '';
            }
    
            if (this.removeImg != null) {
                this.removeImg.style.visibility = '';
            }
        };

        // Rounded edge and vertex handles
        var touchHandle = new mxImage('assets/js/mxgraph/images/handle-main.png', 16, 16);

        mxVertexHandler.prototype.handleImage = touchHandle;
        mxEdgeHandler.prototype.handleImage = touchHandle;
        mxOutline.prototype.sizerImage = touchHandle;
        
        // Pre-fetches touch handle
        new Image().src = touchHandle.src;


    // Enables rotation handle
    mxVertexHandler.prototype.rotationEnabled = true;

    // Enables guides
    mxGraphHandler.prototype.guidesEnabled = true;
    
    // Alt disables guides
    mxGuide.prototype.isEnabledForEvent = function(evt) {
        return !mxEvent.isAltDown(evt);
    };
    
    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.snapToTerminals = true;

    // Defines an icon for creating new connections in the connection handler.
    // This will automatically disable the highlighting of the source vertex.
    mxConnectionHandler.prototype.connectImage = new mxImage('assets/js/mxgraph/images/handle-connect.png', 16, 16);
  
    // Enables connections in the graph and disables
    // reset of zoom and translate on root change
    // (ie. switch between XML and graphical mode).
    editor.graph.setConnectable(true);

    // Clones the source if new connection has no target
    editor.graph.connectionHandler.setCreateTarget(true);

    // Updates the title if the root changes
    var title = document.getElementById('title');
    
    if (title != null) {
        var f = function(sender) {
            title.innerHTML = 'mxDraw - ' + sender.getTitle();
        };
        
        editor.addListener(mxEvent.ROOT, f);
        f(editor);
    }
    
    // Changes the zoom on mouseWheel events
    mxEvent.addMouseWheelListener(function (evt, up) {
        if (!mxEvent.isConsumed(evt)) {
            if (up) {
                editor.execute('zoomIn');
            }
            else {
                editor.execute('zoomOut');
            }
            
            mxEvent.consume(evt);
        }
    });

    // // Defines a new action to switch between
    // // XML and graphical display
    // var textNode = document.getElementById('xml');
    // var graphNode = editor.graph.container;
    // var sourceInput = document.getElementById('source');

    // sourceInput.checked = false;

    // var funct = function(editor) {
    //     if (sourceInput.checked) {
    //         graphNode.style.display = 'none';
    //         textNode.style.display = 'inline';
            
    //         var enc = new mxCodec();
    //         var node = enc.encode(editor.graph.getModel());
            
    //         textNode.value = mxUtils.getPrettyXml(node);
    //         textNode.originalValue = textNode.value;
    //         textNode.focus();
    //     }
    //     else {
    //         graphNode.style.display = '';
            
    //         if (textNode.value != textNode.originalValue) {
    //             var doc = mxUtils.parseXml(textNode.value);
    //             var dec = new mxCodec(doc);
    //             dec.decode(doc.documentElement, editor.graph.getModel());
    //         }

    //         textNode.originalValue = null;
            
    //         // Makes sure nothing is selected in IE
    //         if (mxClient.IS_IE) {
    //             mxUtils.clearSelection();
    //         }

    //         textNode.style.display = 'none';

    //         // Moves the focus back to the graph
    //         editor.graph.container.focus();
    //     }
    // };
    
    // editor.addAction('switchView', funct);
    
    // // Defines a new action to switch between
    // // XML and graphical display
    // mxEvent.addListener(sourceInput, 'click', function() {
    //     editor.execute('switchView');
    // });

    // // Create select actions in page
    // var node = document.getElementById('mainActions');
    // var buttons = ['group', 'ungroup', 'cut', 'copy', 'paste', 'delete', 'undo', 'redo', 'print', 'show'];
    
    // // Only adds image and SVG export if backend is available
    // // NOTE: The old image export in mxEditor is not used, the urlImage is used for the new export.
    // if (editor.urlImage != null) {
    //     // Client-side code for image export
    //     var exportImage = function(editor) {
    //         var graph = editor.graph;
    //         var scale = graph.view.scale;
    //         var bounds = graph.getGraphBounds();
            
    //         // New image export
    //         var xmlDoc = mxUtils.createXmlDocument();
    //         var root = xmlDoc.createElement('output');
    //         xmlDoc.appendChild(root);
            
    //         // Renders graph. Offset will be multiplied with state's scale when painting state.
    //         var xmlCanvas = new mxXmlCanvas2D(root);
    //         xmlCanvas.translate(Math.floor(1 / scale - bounds.x), Math.floor(1 / scale - bounds.y));
    //         xmlCanvas.scale(scale);
            
    //         var imgExport = new mxImageExport();
    //         imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
            
    //         // Puts request data together
    //         var w = Math.ceil(bounds.width * scale + 2);
    //         var h = Math.ceil(bounds.height * scale + 2);
    //         var xml = mxUtils.getXml(root);
            
    //         // Requests image if request is valid
    //         if (w > 0 && h > 0) {
    //             var name = 'export.png';
    //             var format = 'png';
    //             var bg = '&bg=#FFFFFF';
                
    //             new mxXmlRequest(editor.urlImage, 'filename=' + name + '&format=' + format +
    //                 bg + '&w=' + w + '&h=' + h + '&xml=' + encodeURIComponent(xml)).
    //                 simulate(document, '_blank');
    //         }
    //     };
        
    //     editor.addAction('exportImage', exportImage);
        
    //     // Client-side code for SVG export
    //     var exportSvg = function(editor) {
    //         var graph = editor.graph;
    //         var scale = graph.view.scale;
    //         var bounds = graph.getGraphBounds();

    //         // Prepares SVG document that holds the output
    //         var svgDoc = mxUtils.createXmlDocument();
    //         var root = (svgDoc.createElementNS != null) ?
    //             svgDoc.createElementNS(mxConstants.NS_SVG, 'svg') : svgDoc.createElement('svg');
            
    //         if (root.style != null) {
    //             root.style.backgroundColor = '#FFFFFF';
    //         }
    //         else {
    //             root.setAttribute('style', 'background-color:#FFFFFF');
    //         }
            
    //         if (svgDoc.createElementNS == null) {
    //             root.setAttribute('xmlns', mxConstants.NS_SVG);
    //         }
            
    //         root.setAttribute('width', Math.ceil(bounds.width * scale + 2) + 'px');
    //         root.setAttribute('height', Math.ceil(bounds.height * scale + 2) + 'px');
    //         root.setAttribute('xmlns:xlink', mxConstants.NS_XLINK);
    //         root.setAttribute('version', '1.1');
            
    //         // Adds group for anti-aliasing via transform
    //         var group = (svgDoc.createElementNS != null) ?
    //                 svgDoc.createElementNS(mxConstants.NS_SVG, 'g') : svgDoc.createElement('g');
    //         group.setAttribute('transform', 'translate(0.5,0.5)');
    //         root.appendChild(group);
    //         svgDoc.appendChild(root);

    //         // Renders graph. Offset will be multiplied with state's scale when painting state.
    //         var svgCanvas = new mxSvgCanvas2D(group);
    //         svgCanvas.translate(Math.floor(1 / scale - bounds.x), Math.floor(1 / scale - bounds.y));
    //         svgCanvas.scale(scale);
            
    //         var imgExport = new mxImageExport();
    //         imgExport.drawState(graph.getView().getState(graph.model.root), svgCanvas);

    //         var name = 'export.svg';
    //         var xml = encodeURIComponent(mxUtils.getXml(root));
            
    //         new mxXmlRequest(editor.urlEcho, 'filename=' + name + '&format=svg' + '&xml=' + xml).simulate(document, "_blank");
    //     };
        
    //     editor.addAction('exportSvg', exportSvg);
        
    //     buttons.push('exportImage');
    //     buttons.push('exportSvg');
    // };
    
    // for (var i = 0; i < buttons.length; i++) {
    //     var button = document.createElement('button');
    //     mxUtils.write(button, mxResources.get(buttons[i]));
    
    //     var factory = function(name) {
    //         return function() {
    //             editor.execute(name);
    //         };
    //     };
    
    //     mxEvent.addListener(button, 'click', factory(buttons[i]));
    //     node.appendChild(button);
    // }

    // // Create select actions in page
    // var node = document.getElementById('selectActions');

    // mxUtils.write(node, 'Select: ');
    // mxUtils.linkAction(node, 'All', editor, 'selectAll');
    // mxUtils.write(node, ', ');
    // mxUtils.linkAction(node, 'None', editor, 'selectNone');
    // mxUtils.write(node, ', ');
    // mxUtils.linkAction(node, 'Vertices', editor, 'selectVertices');
    // mxUtils.write(node, ', ');
    // mxUtils.linkAction(node, 'Edges', editor, 'selectEdges');

    // // Create select actions in page
    // var node = document.getElementById('zoomActions');

    // mxUtils.write(node, 'Zoom: ');
    // mxUtils.linkAction(node, 'In', editor, 'zoomIn');
    // mxUtils.write(node, ', ');
    // mxUtils.linkAction(node, 'Out', editor, 'zoomOut');
    // mxUtils.write(node, ', ');
    // mxUtils.linkAction(node, 'Actual', editor, 'actualSize');
    // mxUtils.write(node, ', ');
    // mxUtils.linkAction(node, 'Fit', editor, 'fit');

    // Loads the stencils into the registry
    var req = mxUtils.load('assets/js/mxgraph/stencils.xml');
    var root = req.getDocumentElement();
    var shape = root.firstChild;
    
    while (shape != null) {
        if (shape.nodeType == mxConstants.NODETYPE_ELEMENT) {
            mxStencilRegistry.addStencil(shape.getAttribute('name'), new mxStencil(shape));
        }
        
        shape = shape.nextSibling;
    }    
}

window.onbeforeunload = function() { 
    return mxResources.get('changesLost'); 
};


/**
 * HELPER FUNCTIONS FOR TYPESCRIPT
 */
function editorHelper(){};

editorHelper.prototype.load = function() {
    // Passes the container for the graph to the program 
    createEditor('assets/js/mxgraph/config/diagrameditor.xml');
};

editorHelper.prototype.getJsonModel = function() {
    var encoder = new mxCodec();
    var node = encoder.encode(editor.graph.getModel());
    // mxUtils.popup(mxUtils.getXml(node), true);

    // console.log(xml2json(mxUtils.getXml(node), ''));

    var x2js = new X2JS({
        useDoubleQuotes: true
    });
    var jsonObj = x2js.xml_str2json(mxUtils.getXml(node));
    // console.log(JSON.stringify(jsonObj));

    return jsonObj;
};

editorHelper.prototype.showXml = function() {
    var encoder = new mxCodec();
    var node = encoder.encode(editor.graph.getModel());
    mxUtils.popup(mxUtils.getXml(node), true);
};

editorHelper.prototype.loadDiagram = function(jsonData) {
    var x2js = new X2JS({
        useDoubleQuotes: true
    });
    var xmlAsStr = x2js.json2xml_str(jsonData);

    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    var parent = editor.graph.getDefaultParent();

    // Adds cells to the model in a single step
    editor.graph.getModel().beginUpdate();

    try
    {
        // var req = mxUtils.load(filename);
        var doc = mxUtils.parseXml(xmlAsStr);
        var root = doc.documentElement;
        var codec = new mxCodec(root.ownerDocument);
        
        codec.decode(root, editor.graph.getModel());
    }
    finally
    {
        // Updates the display
        editor.graph.getModel().endUpdate();
    }
};

editorHelper.prototype.addStencil = function(shapeName) {
    // Gets the default parent for inserting new cells. This
    // is normally the first child of the root (ie. layer 0).
    var parent = editor.graph.getDefaultParent();

    // Adds cells to the model in a single step
    editor.graph.getModel().beginUpdate();

    try
    {
        // var v4 = editor.graph.insertVertex(parent, null, '', 10, 10, 20, 20, 'shape=' + shapeName + ';verticalLabelPosition=bottom;align=center;html=1;verticalAlign=top;dashed=0;shadow=0;strokeColor=#000000;fillColor=none;gradientColor=none;');
        var v4 = editor.graph.insertVertex(parent, null, '', 10, 10, 20, 20, 'shape=' + shapeName + ';align=center;html=1;verticalAlign=top;dashed=0;shadow=0;strokeColor=#000000;fillColor=none;gradientColor=none;strokeWidth=3;');

        // var v6 = graph.insertVertex(parent, null, 'X2', 340, 110, 80, 80, 'shape=and;flipH=1');
        // var e3 = graph.insertEdge(parent, null, '', v4, v6);
        // e3.geometry.points = [new mxPoint(490, 60), new mxPoint(130, 130)];
    }
    finally
    {
        // Updates the display
        editor.graph.getModel().endUpdate();
    }
};

editorHelper.prototype.execute = function(execmd) {
    editor.execute(execmd);
};

editorHelper.prototype.zoomIn = function() {
    editor.graph.zoomIn();
};

editorHelper.prototype.zoomOut = function() {
    editor.graph.zoomOut();
};

editorHelper.prototype.actualSize = function() {
    editor.graph.zoomActual();
};