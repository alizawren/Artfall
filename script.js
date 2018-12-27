var canvas = null;
var context = null;

var clickX = [];
var clickY = [];
var clickDrag = [];
var clickColor = [];
var paint;

function addClick(x, y, dragging) {
    //console.log('add click,' + x + ',' + y + ',' + dragging);
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(dragging);
    clickColor.push(context.strokeStyle);
}

// Button functions
function getColor(colour) {
    context.strokeStyle = colour;
}

function getSize(size) {
    context.lineWidth = size;
}

function clearCanvas() {
    clickColor = [];
    clickDrag = [];
    clickX = [];
    clickY = [];
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
}

function redraw() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

    for (var i = 0; i < clickX.length; i++) {
        context.beginPath();
        if (clickDrag[i] && i) {
            context.moveTo(clickX[i - 1], clickY[i - 1]);
        } else {
            context.moveTo(clickX[i] - 1, clickY[i]);
        }
        context.lineTo(clickX[i], clickY[i]);
        context.closePath();

        context.lineWidth = 3;
        context.strokeStyle = clickColor[i];

        context.stroke();
    }
}

function  getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
  
    return {
      x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
      y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
  }

$(document).ready(function () {

    /* ======== CANVAS ======== */
    canvas = document.getElementById('the-board');
    if (canvas) {
        console.log("Canvas loaded.")
    }
    var theWidth = canvas.offsetWidth;
    var theHeight = canvas.offsetHeight;
    canvas.width = 1920;
    canvas.height = 1080;
    context = canvas.getContext('2d');

    context.strokeStyle = "#df4b26";

    

    $(canvas).mousedown(function (e) {
        // var mouseX = e.pageX - $(canvas).offset().left;
        // var mouseY = e.pageY - $(canvas).offset().top;

        var mouseX = getMousePos(canvas, e).x;
        var mouseY = getMousePos(canvas, e).y;

        paint = true;
        addClick(mouseX, mouseY, false);
        redraw();
    });

    $(canvas).mousemove(function (e) {
        // var mouseX = e.pageX - $(canvas).offset().left;
        // var mouseY = e.pageY - $(canvas).offset().top;

        var mouseX = getMousePos(canvas, e).x;
        var mouseY = getMousePos(canvas, e).y;

        console.log(mouseX+','+mouseY)

        if (paint) {
            addClick(mouseX, mouseY, true);
            redraw();
        }
    });

    $(canvas).mouseup(function (e) {
        paint = false;
    });

    $(canvas).mouseleave(function (e) {
        paint = false;
    });

    /* ========= Buttons ========== */

    // Clear button
    var clearButton = document.getElementById('clear-button');
    clearButton.onclick = clearCanvas;

    // Color buttons
    const colors = { 'Blue': 'blue', 'Red': '#df4b26', 'Green': 'green' };
    var colorButtonRow = document.getElementById('color-button-row');
    for (const color in colors) {
        var colorButton = document.createElement('button');
        colorButton.classList.add('color-button');
        colorButton.innerHTML = color;
        colorButton.onclick = function () { getColor(colors[color]) };

        colorButtonRow.appendChild(colorButton);
    }

    // Size buttons
    const sizes = { 'Small': 2, 'Medium': 5, 'Large': 10, 'XL': 20 };
    var sizeButtonRow = document.getElementById('size-button-row');
    for (const size in sizes) {
        var sizeButton = document.createElement('button');
        sizeButton.classList.add('size-button');
        sizeButton.innerHTML = size;
        sizeButton.onclick = function () { getSize(sizes[size]) };

        sizeButtonRow.appendChild(sizeButton);
    }

    /* ======== GAME ======== */

    items = ['apple', 'pear', 'orange'];

    var choiceList = document.getElementById('choice-list');

    for (const item of items) {
        var itemDiv = document.createElement('div');
        itemDiv.classList.add('choice');
        itemDiv.innerHTML = item;

        choiceList.appendChild(itemDiv);
    }
});

$(window).resize(function () {
    if (canvas) {
        var theWidth = canvas.offsetWidth;
        var theHeight = canvas.offsetHeight;
        //canvas.width = theWidth;
        //canvas.height = theHeight;
        redraw();
    }
});