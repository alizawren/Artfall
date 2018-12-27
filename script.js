$(document).ready(function () {

    /* ======== CANVAS ======== */

    var canvas = document.getElementById('the-board');
    if (canvas) {
        console.log("Canvas loaded.")
    }
    var context = canvas.getContext('2d');

    var clickX = [];
    var clickY = [];
    var clickDrag = [];
    var clickColor = [];
    var paint;

    context.strokeStyle = "#df4b26";
    context.lineJoin = "round";
    context.lineCap = 'round';
    context.lineWidth = 3;

    $(canvas).mousedown(function (e) {
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;

        paint = true;
        addClick(mouseX, mouseY, false);
        redraw();
    });

    $(canvas).mousemove(function (e) {
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;

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

    function addClick(x, y, dragging) {
        //console.log('add click,' + x + ',' + y + ',' + dragging);
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
        clickColor.push(context.strokeStyle);
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

            context.moveTo(clickX[i - 1], clickY[i - 1]);
            context.lineTo(clickX[i], clickY[i]);
            context.closePath();
            context.stroke();
        }
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


    


    /* ========= Buttons ========== */

    // Clear button
    var clearButton = document.getElementById('clear-button');
    clearButton.onclick = clearCanvas;

    // Color buttons
    const colors = { 'Blue': 'blue', 'Red': 'red', 'Green': 'green' };
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