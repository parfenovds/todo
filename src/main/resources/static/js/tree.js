// Get JSON data
const selectedRadius = 8;
const allowedOptionsForSelect = new Map();
const parentToAllowedOptionsForSelect = new Map();
let addr = 'tasks/api/json';
const token = document.querySelector('meta[name="_csrf"]').content;
const header = document.querySelector('meta[name="_csrf_header"]').content;
let currentUserId = document.querySelector('meta[name="userId"]').content;
// console.log(sessionUserId);
// let currentUserId = sessionUserId;

treeJSON = d3.json(addr, function (error, treeData) {

    allowedOptionsForSelect.set('DIR', ['TASK']);
    allowedOptionsForSelect.set('TASK', ['DIR']);
    // allowedOptionsForSelect.set('win', ['fail', 'question']);
    // allowedOptionsForSelect.set('fail', ['win', 'question']);
    // allowedOptionsForSelect.set('question', ['win', 'fail']);
    // allowedOptionsForSelect.set('answer', []);
    // allowedOptionsForSelect.set('dummy', []);
    // allowedOptionsForSelect.set('question', ['win', 'fail']);

    parentToAllowedOptionsForSelect.set('init', ['answer']);
    parentToAllowedOptionsForSelect.set('win', []);
    parentToAllowedOptionsForSelect.set('fail', []);
    parentToAllowedOptionsForSelect.set('answer', ['question', 'win', 'fail']);
    parentToAllowedOptionsForSelect.set('question', ['answer']);

    // Calculate total nodes, max label length
    let totalNodes = 0;
    let maxLabelLength = 0;
    // variables for drag/drop
    let selectedNode = null;
    let draggingNode = null;
    // panning variables
    let panSpeed = 200;
    let panBoundary = 20; // Within 20px from edges will pan when dragging.
    // Misc. variables
    let i = 0;
    let duration = 750;
    let root;
    let lastSelectedNodeData = null;
    let lastSelectedNode = null;
    let lastSelectedLink = null;
    let lastPickedTypeOfNode = null;
    let widthOfRightPanel = 288;
    let waitingForPair = false;
    let linkIsSelected = false;
    let counter = -1;
    let counterSet = false;
    let lastParentToCut = null;
    let changesSaved = false;
    let nameChangeTimerId = null;
    let lastSavedName = new Map();
    let textChangeTimerId = null;
    let lastSavedText = new Map();

    // size of the diagram
    let viewerWidth = $(document).width() - widthOfRightPanel;
    let viewerHeight = $(document).height() * 0.9;

    let tree = d3.layout.tree()
        .size([viewerHeight, viewerWidth]);

    // define a d3 diagonal projection for use by the node paths later on.
    let diagonal = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });


    //**************************

    // d3.select("#rightDiv")
    //     .append("button")
    //     .html("Get JSON to console")
    //     .attr("class", "rightButton")
    //     .on("click", getJson);

    // async function sendJson() {
    //     console.log("here?");
    //
    //     const getCircularReplacer = (deletePorperties) => { //func that allows a circular json to be stringified
    //         const seen = new WeakSet();
    //         return (key, value) => {
    //             if (typeof value === "object" && value !== null) {
    //                 if (deletePorperties) {
    //                     delete value.id; //delete all properties you don't want in your json (not very convenient but a good temporary solution)
    //                     delete value.x0;
    //                     delete value.y0;
    //                     delete value.y;
    //                     delete value.x;
    //                     delete value.depth;
    //                     // delete value.size;
    //                 }
    //                 if (seen.has(value)) {
    //                     return;
    //                 }
    //                 seen.add(value);
    //             }
    //             return value;
    //         };
    //     };
    //
    //     let myRoot = JSON.stringify(root, getCircularReplacer(false)); //Stringify a first time to clone the root object (it's allow you to delete properties you don't want to save)
    //     let myvar = JSON.parse(myRoot);
    //     myvar = JSON.stringify(myvar, getCircularReplacer(true));
    //     let response = await fetch('/getJson', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json;charset=utf-8'
    //         },
    //         body: myvar
    //     });
    //     console.log("first");
    //     let result = await response;
    //     console.log("second");
    //     alert(result.status);
    //     window.onbeforeunload = null;
    // }

    // d3.select("#rightDiv")
    //     .append("button")
    //     .html("Save")
    //     .attr("class", "rightButton")
    //     .on("click", sendJson);

    d3.select("#rightDiv")
        .append("button")
        .html("addNode")
        .attr("class", "rightButton")
        .attr("data-title", "Кликни на ноду, для которой нужно сделать дочернюю ноду, а следом нажми эту кнопку.")
        .on("click", addNode);

    d3.select("#rightDiv")
        .append("button")
        .html("removeNode")
        .attr("class", "rightButton")
        .attr("data-title", "Кликни на ноду, которую хочешь удалить, а затем на эту кнопку. Корневая нода не может быть удалена!")
        .on("click", removeNode);

    // d3.select("#rightDiv")
    //     .append("button")
    //     .html("addLink")
    //     .attr("class", "rightButton")
    //     .attr("data-title", "")
    //     .on("click", addAdditionalParentLink);
    //
    // d3.select("#rightDiv")
    //     .append("button")
    //     .html("cancelLinking")
    //     .attr("class", "rightButton")
    //     .attr("data-title", "")
    //     .on("click", cancelLinking);
    //
    // d3.select("#rightDiv")
    //     .append("button")
    //     .html("removeLink")
    //     .attr("class", "rightButton")
    //     .attr("data-title", "Click on the CUSTOM node you'd like to remove and then click this button.")
    //     .on("click", removeAdditionalParentLink);

    d3.select("#rightDiv")
        .append("button")
        .html("toggleNode")
        .attr("class", "rightButton")
        .attr("data-title", "Показать или спрятать дочерние ноды")
        .on("click", toggleChildren);

    d3.select("#rightDiv")
        .append("p")
        .attr("class", "rightButton")
        .attr("data-title", "Краткое имя ноды")
        .text("Короткое имя ноды");

    d3.select("#rightDiv")
        .append("input")
        .attr("type", "text")
        .attr("class", "rightButton")
        .attr("id", "nameField")
        .on("input", saveName);

    // d3.select("#rightDiv")
    //     .append("button")
    //     .html("saveName")
    //     .attr("class", "rightButton")
    //     .on("click", saveName);

    d3.select("#rightDiv")
        .append("p")
        .attr("class", "rightButton")
        .attr("data-title", "Полный текст ноды")
        .text("Текст ноды");

    d3.select("#rightDiv")
        .append("textarea")
        .attr("class", "rightButton")
        .attr("id", "textField")
        .attr("rows", "14")
        .attr("cols", "25")
        .on("input", saveText);

    d3.select("#rightDiv")
        .append("p")
        .attr("class", "rightButton")
        .attr("data-title", "Завершена ли таска?")
        .text("Done?");

    d3.select("#rightDiv")
        .append("input")
        .attr("type", "checkbox")
        .attr("class", "rightButton")
        .attr("id", "checkBoxDone")
        .on("click", toggleDone);

    // d3.select("#rightDiv")
    //     .append("button")
    //     .html("saveText")
    //     .attr("class", "rightButton")
    //     .on("click", saveText);

    d3.select("#rightDiv")
        .append("p")
        .attr("class", "rightButton")
        .text("Тип ноды");

    let data = [{"TYPE": "DIR"},
        {"TYPE": "TASK"}];

    let dropDown = d3.select("#rightDiv").append("select")
        .attr("class", "rightButton")
        .attr("id", "nameList")
        .attr("name", "name-list")
        .on("change", setType);

    let options = dropDown.selectAll("option")
        .data(data)
        .enter()
        .append("option");

    options.text(function (d) {
        return d.TYPE;
    })
        .attr("value", function (d) {
            return d.TYPE;
        });


    // function getTypeOfCreatingNode() {
    //     const openModal = document.querySelector('.openModal');
    //     const questionButton = document.querySelector('.questionButton');
    //     const winButton = document.querySelector('.winButton');
    //     const failButton = document.querySelector('.failButton');
    //     const modal = document.querySelector('.modal');
    //     questionButton.addEventListener('click', () => {
    //         lastPickedTypeOfNode = 'question';
    //         modal.close();
    //     })
    //     winButton.addEventListener('click', () => {
    //         lastPickedTypeOfNode = 'win';
    //         modal.close();
    //     })
    //     failButton.addEventListener('click', () => {
    //         lastPickedTypeOfNode = 'fail';
    //         modal.close();
    //     })
    //     modal.showModal();
    //     alert("boo");
    //
    //     return lastPickedTypeOfNode;
    // }

    async function toggleDone() {
        let elementById = document.getElementById("checkBoxDone");
        lastSelectedNodeData.done = !!elementById.checked;
        console.log("Done?");
        update(lastSelectedNodeData);
        let myvar = JSON.stringify({"done": lastSelectedNodeData.done});
        let newObj = await fetch('/tasks/api/' + lastSelectedNodeData.nodeId, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                "X-CSRF-TOKEN": token
            },
            body: myvar
        });
        console.log(newObj);
    }
    async function addNode() {
        // if(!counterSet) {
        //     counterSet = true;
        //     let maximum = 0;
        //     d3.selectAll('.ghostCircle').filter(function (d) {
        //         if(Number(d.node_id) > maximum) {
        //             console.log("!!!" + maximum);
        //             maximum = Number(d.node_id);
        //         }
        //         return false;
        //     });
        //     counter = maximum + 1;
        // }
        if (lastSelectedNodeData != null) {
            console.log("!" + lastSelectedNodeData);
            if (!lastSelectedNodeData.hasOwnProperty('children')) {
                lastSelectedNodeData.children = [];
            }
            let str = 'TASK';
            // let currentId = counter--;
            let nodeBillet = {
                'nodeId': -1,
                'userId': currentUserId,
                'parentId': lastSelectedNodeData.nodeId,
                'name': str,
                'text': "put your text here",
                'type': str,
                'done': false,
                'changed': true,
                'children': []
            }
            let myvar = JSON.stringify(nodeBillet);
            let newObj = await fetch('/tasks/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    "X-CSRF-TOKEN": token
                },
                body: myvar
            });
            console.log(newObj);
            let nodeIdFromDb = await newObj.json();
            nodeBillet.nodeId = nodeIdFromDb;
            nodeBillet.name += nodeIdFromDb;
            // if (lastSelectedNodeData.type === 'init' || lastSelectedNodeData.type === 'question') {
            //     str = 'answer';
            // } else {
            //     // str = getTypeOfCreatingNode();
            //     str = 'question';
            //     lastSelectedNodeData.lonely_child = currentId.toString();
            // }

            lastSelectedNodeData.children.push(nodeBillet);
            update(root);
            console.log("?" + lastSelectedNodeData.children);
        } else {
            console.log("You should select Node you'd like to have a child first!");
        }
    }


    async function removeNode() {
        if (lastSelectedNodeData != null && lastSelectedNodeData.hasOwnProperty('parent')) {
            let myvar = JSON.stringify(lastSelectedNodeData.nodeId);
            let newObj = await fetch('/tasks/api/' + lastSelectedNodeData.nodeId, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    "X-CSRF-TOKEN": token
                },
                body: myvar
            });
            console.log(newObj);

            let children = [];
            lastSelectedNodeData.parent.children.forEach(function (child) {
                if (child !== lastSelectedNodeData) {
                    children.push(child);
                } else if (lastSelectedNodeData.parent.lonely_child !== "0") {
                    lastSelectedNodeData.parent.lonely_child = "0";
                }
            });
            lastSelectedNodeData.parent.children = children;
            update(lastSelectedNodeData.parent);
            lastSelectedNodeData = null;
        } else {
            console.log("NO");
        }
    }

    function saveText() {
        async function sendRequest(node) {
            if(lastSavedText.get(node.nodeId) !== node.text) {
                let myvar = JSON.stringify({"text": node.text});
                let newObj = await fetch('/tasks/api/' + node.nodeId, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8',
                        "X-CSRF-TOKEN": token
                    },
                    body: myvar
                });
                lastSavedText.set(node.nodeId, node.text);
                console.log(newObj);
            }
        }
        if (lastSelectedNodeData != null) {
            if(textChangeTimerId !== null) {
                clearTimeout(textChangeTimerId);
            }
            let text = document.getElementById("textField").value;
            console.log(lastSelectedNodeData.text);
            lastSelectedNodeData.text = text;
            textChangeTimerId = setTimeout(sendRequest, 1500, lastSelectedNodeData);
        }
    }

    async function saveName() {
        async function sendRequest(node) {
            if(lastSavedName.get(node.nodeId) !== node.name) {
                let myvar = JSON.stringify({"name": node.name});
                let newObj = await fetch('/tasks/api/' + node.nodeId, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8',
                        "X-CSRF-TOKEN": token
                    },
                    body: myvar
                });
                lastSavedName.set(node.nodeId, node.name);
                console.log(newObj);
            }
        }
        if (lastSelectedNodeData != null) {
            // outerNameChangeTimerId = setTimeout(sendRequest, 20000, lastSelectedNodeData);
            if(nameChangeTimerId !== null) {
                clearTimeout(nameChangeTimerId);
            }
            let name = document.getElementById("nameField").value;
            console.log(lastSelectedNodeData.name);
            lastSelectedNodeData.name = name;
            update(root);
            nameChangeTimerId = setTimeout(sendRequest, 1500, lastSelectedNodeData);
        }
    }

    async function setType() {
        lastSelectedNodeData.type = document.getElementById("nameList").value;
        fillSelectWithOptions();
        update(root);
        let myvar = JSON.stringify({"type": lastSelectedNodeData.type});
        let newObj = await fetch('/tasks/api/' + lastSelectedNodeData.nodeId, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                "X-CSRF-TOKEN": token
            },
            body: myvar
        });
        console.log(newObj);
    }


    //*************************

    // A recursive helper function for performing some setup by walking through all nodes

    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        let children = childrenFn(parent);
        if (children) {
            let count = children.length;
            for (let i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }
    }

    // Call visit function to establish maxLabelLength
    visit(treeData, function (d) {
        totalNodes++;
        maxLabelLength = Math.max(d.name.length, maxLabelLength);

    }, function (d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });


    // sort the tree according to the node names

    function sortTree() {
        tree.sort(function (a, b) {
            return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
        });
    }

    // Sort the tree initially incase the JSON isn't in a sorted order.
    sortTree();

    // TODO: Pan function, can be better implemented.

    function pan(domNode, direction) {
        let speed = panSpeed;
        if (panTimer) {
            clearTimeout(panTimer);
            translateCoords = d3.transform(svgGroup.attr("transform"));
            if (direction == 'left' || direction == 'right') {
                translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                translateY = translateCoords.translate[1];
            } else if (direction == 'up' || direction == 'down') {
                translateX = translateCoords.translate[0];
                translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
            }
            scaleX = translateCoords.scale[0];
            scaleY = translateCoords.scale[1];
            scale = zoomListener.scale();
            svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
            d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
            zoomListener.scale(zoomListener.scale());
            zoomListener.translate([translateX, translateY]);
            panTimer = setTimeout(function () {
                pan(domNode, speed, direction);
            }, 50);
        }
    }

    // Define the zoom function for the zoomable tree

    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }


    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    let zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    // function constraintChooser(potentialParent, draggingNode) {
    //     console.log(potentialParent.node().__data__);
    //     let attr = potentialParent.attr('nodeType');
    //     let type = draggingNode.type;
    //     if (type === 'dummy') return false;
    //     if (type === 'init') return false;
    //     if (type === 'win' || type === 'fail' || type === 'question') {
    //         let hasChildren = false;
    //         if (potentialParent.node().__data__.hasOwnProperty('children') &&
    //             potentialParent.node().__data__.children.length > 0) {
    //             hasChildren = true;
    //         }
    //         return attr === 'answer' && !hasChildren;
    //     }
    //     if (type === 'answer') {
    //         return attr === 'question' || attr === 'init';
    //     }
    //     return false;
    // }

    function initiateDrag(d, domNode) {
        draggingNode = d;
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
        d3.selectAll('.ghostCircle')
        //     .filter(function () {
        //     let potentialParent = d3.select(this);
        //     return constraintChooser(potentialParent, draggingNode);
        // })
            .attr('class', 'ghostCircle show');
        d3.select(domNode).attr('class', 'node activeDrag');


        svgGroup.selectAll("g.node").sort(function (a, b) { // select the parent and sort the path's
            if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
            else return -1; // a is the hovered element, bring "a" to the front
        });
        // if nodes has children, remove the links and nodes
        if (nodes.length > 1) {
            // remove link paths
            links = tree.links(nodes);
            nodePaths = svgGroup.selectAll("path.link")
                .data(links, function (d) {
                    return d.target.id;
                }).remove();
            // remove child nodes
            nodesExit = svgGroup.selectAll("g.node")
                .data(nodes, function (d) {
                    return d.id;
                }).filter(function (d, i) {
                    if (d.id == draggingNode.id) {
                        return false;
                    }
                    return true;
                }).remove();
        }

        // remove parent link
        parentLink = tree.links(tree.nodes(draggingNode.parent));
        svgGroup.selectAll('path.link').filter(function (d, i) {
            if (d.target.id == draggingNode.id) {
                if (d.target.parent.lonely_child !== "0") {
                    lastParentToCut = d.target.parent;
                    console.log("WOOOSH!");
                    console.log(d.target.parent.lonely_child);
                    // d.target.parent.lonely_child = "";
                }
                return true;
            }
            return false;
        }).remove();

        dragStarted = null;
    }

    // define the baseSvg, attaching a class for styling and the zoomListener
    let baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .call(zoomListener);


    // Define the drag listeners for drag/drop behaviour of nodes.
    dragListener = d3.behavior.drag()
        .on("dragstart", function (d) {
            if (d == root) {
                return;
            }
            dragStarted = true;
            nodes = tree.nodes(d);
            d3.event.sourceEvent.stopPropagation();
            // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
        })
        .on("drag", function (d) {
            if (d == root) {
                return;
            }
            if (dragStarted) {
                domNode = this;
                initiateDrag(d, domNode);
            }

            // get coords of mouseEvent relative to svg container to allow for panning
            relCoords = d3.mouse($('svg').get(0));
            if (relCoords[0] < panBoundary) {
                panTimer = true;
                pan(this, 'left');
            } else if (relCoords[0] > ($('svg').width() - panBoundary)) {

                panTimer = true;
                pan(this, 'right');
            } else if (relCoords[1] < panBoundary) {
                panTimer = true;
                pan(this, 'up');
            } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
                panTimer = true;
                pan(this, 'down');
            } else {
                try {
                    clearTimeout(panTimer);
                } catch (e) {

                }
            }

            d.x0 += d3.event.dy;
            d.y0 += d3.event.dx;
            let node = d3.select(this);
            node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
            updateTempConnector();
        }).on("dragend", function (d) {
            if (d == root) {
                return;
            }
            domNode = this;
            if (selectedNode && checkPossibilityOfTransition(selectedNode, draggingNode)) {
                // now remove the element from the parent, and insert it into the new elements children
                let index = draggingNode.parent.children.indexOf(draggingNode);
                if (index > -1) {
                    draggingNode.parent.children.splice(index, 1);
                }
                if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                    if (typeof selectedNode.children !== 'undefined') {
                        selectedNode.children.push(draggingNode);
                    } else {
                        selectedNode._children.push(draggingNode);
                    }
                } else {
                    selectedNode.children = [];
                    selectedNode.children.push(draggingNode);
                }
                // Make sure that the node being added to is expanded so user can see added node is correctly moved
                expand(selectedNode);
                sortTree();
                endDrag();
            } else {
                endDrag();
            }
        });

    function checkPossibilityOfTransition(selectedNode, draggingNode) {
        console.log("!!!!" + selectedNode.type);
        return true;
    }

    async function endDrag() {
        selectedNode = null;
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
        d3.select(domNode).attr('class', 'node');
        // now restore the mouseover event or we won't be able to drag a 2nd time
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
        updateTempConnector();
        if (draggingNode !== null) {
            console.log("MOVING!");
            console.log(draggingNode);
            update(root);
            if (lastParentToCut != null && lastParentToCut.type === "answer" && lastParentToCut !== draggingNode.parent) {
                draggingNode.parent.lonely_child = lastParentToCut.lonely_child;
                lastParentToCut.lonely_child = "0";
            }
            // let myvar = JSON.stringify({"parent": draggingNode.parent.nodeId});
            // let newObj = await fetch('/tasks/' + draggingNode.nodeId, {
            //     method: 'PATCH',
            //     headers: {
            //         'Content-Type': 'application/json;charset=utf-8'
            //     },
            //     body: myvar
            // });
            // console.log(newObj);
            if(draggingNode.parentId !== draggingNode.parent.nodeId) {
                draggingNode.parentId = draggingNode.parent.nodeId;
                let myvar = JSON.stringify({
                    'nodeId': draggingNode.nodeId,
                    'userId': currentUserId,
                    'parentId': draggingNode.parentId,
                    'name': draggingNode.name,
                    'text': draggingNode.text,
                    'type': draggingNode.type,
                    'done': draggingNode.done,
                    'changed': draggingNode.changed
                });
                console.log("mememe");

                console.log(myvar);
                let newObj = await fetch('/tasks/api', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8',
                        "X-CSRF-TOKEN": token
                    },
                    body: myvar
                });
                console.log(newObj);
            }
            centerNode(draggingNode);
            draggingNode = null;
        }
    }

    // Helper functions for collapsing and expanding nodes.

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }

    let overCircle = function (d) {
        selectedNode = d;
        updateTempConnector();
    };
    let outCircle = function (d) {
        selectedNode = null;
        updateTempConnector();
    };

    // Function to update the temporary connector indicating dragging affiliation
    let updateTempConnector = function () {
        let data = [];
        if (draggingNode !== null && selectedNode !== null) {
            // have to flip the source coordinates since we did this for the existing connectors on the original tree
            data = [{
                source: {
                    x: selectedNode.y0, y: selectedNode.x0
                }, target: {
                    x: draggingNode.y0, y: draggingNode.x0
                }
            }];
        }
        let link = svgGroup.selectAll(".templink").data(data);

        link.enter().append("path")
            .attr("class", "templink")
            .attr("d", d3.svg.diagonal())
            .attr('pointer-events', 'none');

        link.attr("d", d3.svg.diagonal());

        link.exit().remove();
    };

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

    function centerNode(source) {
        scale = zoomListener.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scale + viewerWidth / 2;
        y = y * scale + viewerHeight / 2;
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
    }

    // Toggle children function

    function toggleChildren() {
        if (lastSelectedNodeData.children) {
            lastSelectedNodeData._children = lastSelectedNodeData.children;
            lastSelectedNodeData.children = null;
        } else if (lastSelectedNodeData._children) {
            lastSelectedNodeData.children = lastSelectedNodeData._children;
            lastSelectedNodeData._children = null;
        }
        update(root);
        centerNode(lastSelectedNodeData);
        return lastSelectedNodeData;
    }


    function fillSelectWithOptions() {
        let select = document.getElementById("nameList");
        select.value = lastSelectedNodeData.type;
        for (let j = 0; j < select.options.length; j++) {
            select.options[j].disabled = true;
        }
        let allowedOptions = allowedOptionsForSelect.get(lastSelectedNodeData.type);
        // let allowedOptions;
        // if (lastSelectedNodeData.type === 'dummy') {
        //     allowedOptions = parentToAllowedOptionsForSelect.get(lastSelectedNodeData.parent.type);
        // } else if (lastSelectedNodeData.type === 'question' &&
        //     (lastSelectedNodeData.hasOwnProperty('children') && lastSelectedNodeData.children.length > 0)) {
        //     allowedOptions = [];
        // } else {
        //     allowedOptions = allowedOptionsForSelect.get(lastSelectedNodeData.type);
        //     console.log(allowedOptions);
        // }
        for (let j = 0; j < select.options.length; j++) {
            for (let k = 0; k < allowedOptions.length; k++) {
                console.log(select.options[j].value);
                if (allowedOptions[k] === select.options[j].value) {
                    console.log(j)
                    select.options[j].disabled = false;
                    // continue;
                }
            }
        }
    }

    function cancelLinking() {
        waitingForPair = false;
    }

    function addAdditionalParentLink() {
        waitingForPair = true;
    }

    function removeAdditionalParentLink() {
        if (lastSelectedLink !== null && linkIsSelected) {
            let src = lastSelectedLink.getAttribute('src');
            let trg = lastSelectedLink.getAttribute('trg');
            d3.selectAll('.ghostCircle').filter(function (d) {
                if (d.node_id === src) {
                    d.additional_linked_nodes = d.additional_linked_nodes.filter(function (value, index, arr) {
                        return value.node_id !== trg;
                    });
                    if (d.additional_linked_nodes.length === 0) {
                        delete d.additional_linked_nodes;
                    }
                }
                return this.node_id === src;
            });
            update(root);
        } else {
            console.log("NO");
        }
    }

    function deselectLink() {
        if (lastSelectedLink != null) {
            d3.select(lastSelectedLink)
                .attr("class", "additionalParentLink");
            // lastSelectedLink = null;
            linkIsSelected = false;
        } else {
            console.log("ELSE");
        }
    }

    function clickAdditionalParentLink(d) {
        waitingForPair = false;
        console.log("addParentLink is: ");
        console.log(this);
        console.log("Look here:");
        console.log(lastSelectedNodeData);
        deselectNode();
        deselectLink();
        linkIsSelected = true;

        lastSelectedLink = this;
        d3.select(this)
            .attr("class", "selectedAdditionalParentLink");
        // select.classed("additionalParentLink", false);
        // select.classed("selectedAdditionalParentLink", true);
    }

    function clickLink(d) {
        console.log("link is:");
        console.log(d);
    }

    function deselectNode() {
        if (lastSelectedNode != null) {
            d3.select(lastSelectedNode).select("circle")
                .attr("r", 4.5);
            lastSelectedNode = null;
            lastSelectedNodeData = null;
            let nameField = document.getElementById("nameField");
            nameField.value = "";

            let textField = document.getElementById("textField");
            textField.value = "";
        }
    }

    function click(d) {
        if (d3.event.defaultPrevented) return; // click suppressed
        // if(lastSelectedNode != null) {
        //     lastSelectedNodeData.text = document.getElementById("textField").value;
        //     lastSelectedNodeData.name = document.getElementById("nameField").value;
        //     update(root);
        // }
        if (!waitingForPair || this === lastSelectedNode) {
            console.log(d);
            deselectNode();
            deselectLink();
            lastSelectedNode = this;
            lastSelectedNodeData = d;
            console.log(lastSelectedNodeData);

            d3.select(this).select("circle")
                .attr("r", selectedRadius);

            let nameField = document.getElementById("nameField");
            nameField.value = d.name;

            let textField = document.getElementById("textField");
            textField.value = d.text;

            let checkBoxDone = document.getElementById("checkBoxDone");
            checkBoxDone.checked = d.done;


            fillSelectWithOptions();


            // d = toggleChildren(d);
            // update(d);
            // centerNode(d);
        } else {
            if (!lastSelectedNodeData.hasOwnProperty('additional_linked_nodes')) {
                console.log("BOOOO");
                lastSelectedNodeData.additional_linked_nodes = [];
            }
            lastSelectedNodeData.additional_linked_nodes.push({"nodeId": d.nodeId});
            update(root);
            waitingForPair = false;
            // if(!lastSelectedNodeData.hasOwnProperty('additional_linked_nodes')) {
            // }
        }
    }

    function update(source) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        // window.onbeforeunload = function () {
        //     setTimeout(waitForSaving, 1500);
        //     return 'You have unsaved changes!';
        // }
        let levelWidth = [1];
        let childCount = function (level, n) {

            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function (d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, root);
        let newHeight = d3.max(levelWidth) * 45; // 25 pixels per line
        tree = tree.size([newHeight, viewerWidth]);

        svgGroup.append("svg:defs").append("svg:marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 -5 10 10")
            .attr('refX', 17)//so that it comes towards the center.
            // .attr('refY', -20)//so that it comes towards the center.
            .attr("markerWidth", 5)
            .attr("markerHeight", 5)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");

        svgGroup.append("svg:defs").append("svg:marker")
            .attr("id", "arrow_back")
            .attr("viewBox", "0 -5 10 10")
            .attr('refX', 17)//so that it comes towards the center.
            // .attr('refY', -20)//so that it comes towards the center.
            .attr("markerWidth", 5)
            .attr("markerHeight", 5)
            .attr("orient", "auto-start-reverse")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");

        // Compute the new tree layout.
        let nodes = tree.nodes(root).reverse(), links = tree.links(nodes);

        // Set widths between levels based on maxLabelLength.
        nodes.forEach(function (d) {
            d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            // d.y = (d.depth * 500); //500px per level.
        });

        // Update the nodes…
        node = svgGroup.selectAll("g.node")
            .data(nodes, function (d) {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        let nodeEnter = node.enter().append("g")
            .call(dragListener)
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        nodeEnter.append("circle")
            .attr('class', 'nodeCircle')
            .attr("r", 0)
            .style("fill", function (d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        nodeEnter.append("text")
            .attr("x", function (d) {
                return d.children || d._children ? -10 : 10;
            })
            .attr("dy", ".35em")
            .attr('class', 'nodeText')
            .attr("text-anchor", function (d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function (d) {
                return d.name;
            })
            .style("fill-opacity", 0);

        // phantom node to give us mouseover in a radius around it
        nodeEnter.append("circle")
            .attr('class', 'ghostCircle')
            .attr('nodeType', function (d) {
                if (d.type === "DIR") return "DIR";
                else if (d.type === "TASK") return "TASK";
                else return "dummy";
            })
            .attr("r", 30)
            .attr("opacity", 0.2) // change this to zero to hide the target area
            .style("fill", "blue")
            .attr('pointer-events', 'mouseover')
            .on("mouseover", function (node) {
                overCircle(node);
            })
            .on("mouseout", function (node) {
                outCircle(node);
            });

        // Update the text to reflect whether node has children or not.
        node.select('text')
            .attr("x", function (d) {
                return d.children || d._children ? -17 : 10;
            })
            .attr("text-anchor", function (d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function (d) {
                return d.name;
            });

        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
            .attr("r", 4.5)
            .style("fill", function (d) {
                return d._children ? "lightsteelblue" : "#fff";
            });

        node.select("circle.nodeCircle")
            .attr("r", function (d) {
                return d === lastSelectedNodeData ? selectedRadius : 4.5
            })
            .style("fill", function (d) {
                if(d.quest_id == -1 || d.quest_id == null) {
                    d.quest_id = currentUserId;
                } else {
                    currentUserId = d.quest_id;
                }
                if (d.done) return "#258039";
                else if (d.type === "DIR") return "#F5BE41";
                else if (d.type === "TASK") return "#fff";
                else return "#fff";
            });

        // Transition nodes to their new position.
        let nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        let nodeExit = node.exit().transition()
            .attr("transform", function (d) {
                d.additional_linked_nodes = null;
                return "translate(" + source.y + "," + source.x + ")";
            })
            .duration(duration)
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);

        nodeExit.select("text")
            .style("fill-opacity", 0);

        // Update the links…
        let link = svgGroup.selectAll("path.link")
            .data(links, function (d) {
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function (d) {
                let o = {
                    x: source.x0, y: source.y0
                };
                return diagonal({
                    source: o, target: o
                });
            })
            .attr('marker-end', (d) => "url(#arrow)")
            .on("click", clickLink);

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function (d) {
                let o = {
                    x: source.x, y: source.y
                };
                return diagonal({
                    source: o, target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
        console.log("REMOVING");
        d3.selectAll('.additionalParentLink').remove();
        d3.selectAll('.selectedAdditionalParentLink').remove();

        let multiParents = [];

        function setPairs(node, additional_linked_nodes) {
            console.log("!!!!!!")
            console.log(additional_linked_nodes);

            function getFilter(j) {
                let result = "hello";
                d3.selectAll('.ghostCircle').filter(function () {
                    if (d3.select(this).node().__data__.node_id === additional_linked_nodes[j].node_id) {
                        result = d3.select(this).node().__data__;
                        return true;
                    }
                    return false;
                });
                return result;
            }

            for (let j = 0; j < additional_linked_nodes.length; j++) {
                multiParents.push({parent: node.node().__data__, child: getFilter(j)});
            }
        }

        function getNodesWithParents(node) {
            if (node.node().__data__.hasOwnProperty('additional_linked_nodes')
                && node.node().__data__.additional_linked_nodes !== null) {
                console.log(node.node().__data__.additional_linked_nodes);
                setPairs(node, node.node().__data__.additional_linked_nodes);
            }
            return node.node().__data__.hasOwnProperty('additional_linked_nodes') &&
                node.node().__data__.length > 0;
        }

        let selectedNodesWithParents = d3.selectAll('.ghostCircle')
            .filter(function () {
                return getNodesWithParents(d3.select(this));
            });

        for (let j = 0; j < selectedNodesWithParents.length; j++) {
            console.log(selectedNodesWithParents);
        }
        console.log(multiParents);

        // let couplingParent1 = tree.nodes(root).filter(function(d) {
        //     return d['name'] === 'Начальная нода';
        // })[0];
        // console.log(couplingParent1);
        // let couplingChild1 = tree.nodes(root).filter(function(d) {
        //     return d['name'] === 'JSONConverter';
        // })[0];
        //
        // multiParents = [{
        //     parent: couplingParent1,
        //     child: couplingChild1
        // }];
        //
        multiParents.forEach(function (multiPair) {
            svgGroup.append("path", "g")
                .attr("class", "additionalParentLink")
                .attr('marker-start', (d) => "url(#arrow_back)")
                .attr('src', multiPair.parent.node_id)
                .attr('trg', multiPair.child.node_id)
                .attr("d", function (d) {
                    let oTarget = {
                        x: multiPair.parent.x0,
                        y: multiPair.parent.y0
                    };
                    let oSource = {
                        x: multiPair.child.x0,
                        y: multiPair.child.y0
                    };
                    // if (multiPair.child.depth === multiPair.couplingParent1.depth) {
                    //      return "M" + oSource.y + " " + oSource.x + " L" + (oTarget.y + ((Math.abs((oTarget.x - oSource.x))) * 0.25)) + " " + oTarget.x + " " + oTarget.y + " " + oTarget.x;
                    // }
                    return diagonal({
                        source: oSource,
                        target: oTarget
                    });
                })
                .on("click", clickAdditionalParentLink);
        });

        // d3.selectAll(".additionalParentLink").append("circle")
        //     .attr("class", "hello")
        //     .attr("r", 30)
        //     .attr("opacity", 0.2)
        //     .style("fill", "purple");


    }

    // let zoom = d3.behavior.zoom().translate([100,50]).scale(2);
    // Append a group which holds all nodes and which the zoom Listener can act upon.
    let svgGroup = baseSvg.append("g");
    // let svgGroup = baseSvg.append("svg:svg")
    // .attr("width", viewerWidth)
    // .attr("height", viewerHeight)
    //
    // .call(zoom.on("zoom", 2))
    // .append("svg:g")
    // .attr("transform","translate(100,50)scale(2,2)");


    // .call(zoom.on("zoom",zooming))
    // .append("svg:g")
    // .attr("transform","translate(100,50)scale(.5,.5)");

    // Define the root
    root = treeData;
    root.x0 = viewerHeight / 2;
    root.y0 = 0;

    // Layout the tree initially and center on the root node.
    update(root);
    centerNode(root);



    // function getJson() {
    //     console.log(root); //root contains everything you need
    //     const getCircularReplacer = (deletePorperties) => { //func that allows a circular json to be stringified
    //         const seen = new WeakSet();
    //         return (key, value) => {
    //             if (typeof value === "object" && value !== null) {
    //                 if (deletePorperties) {
    //                     delete value.id; //delete all properties you don't want in your json (not very convenient but a good temporary solution)
    //                     delete value.x0;
    //                     delete value.y0;
    //                     delete value.y;
    //                     delete value.x;
    //                     delete value.depth;
    //                     // delete value.size;
    //                 }
    //                 if (seen.has(value)) {
    //                     return;
    //                 }
    //                 seen.add(value);
    //             }
    //             return value;
    //         };
    //     };
    //
    //     let myRoot = JSON.stringify(root, getCircularReplacer(false)); //Stringify a first time to clone the root object (it's allow you to delete properties you don't want to save)
    //     let myvar = JSON.parse(myRoot);
    //     myvar = JSON.stringify(myvar, getCircularReplacer(true)); //Stringify a second time to delete the propeties you don't need
    //
    //     console.log(myvar); //You have your json in myvar
    // }


})
    .header("Content-Type","application/json")
    .header(header, token)
    .send("POST", JSON.stringify({questId: currentUserId}));

