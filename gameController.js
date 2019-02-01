/* The purpose of this file is to handle the flow of the game and connect input and view. */

var canvas = null;
var context = null;

var clickX = [];
var clickY = [];
var clickDrag = [];
var clickColor = [];
var paint;

var numPlayers = 0;
var players = [];
var audience = [];

// game variables
var gameStarted = false;
var item;
var isArtThief = false;
var isArtist = false;
var choices = [];
var clientVoteCounts = {};

const playerColors = ['#27a4dd', '#f1646c', '#fac174', '#97dec3', '#f39cc3', '#e4ef8b', '#c494e8', '#625674'];
const playerColorOutlines = ['#2564a9', '#e63d53', '#ee7659', '#908895', '#e85f95', '#d9926a', '#bb5bb1', '#5d3559']

var currentPlayer = '';
var currentColor = '#000';

var currentSelectedChoice;

function addClick(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(dragging);
    clickColor.push(currentColor);
}

function changeColor(colour) {
    currentColor = colour;
}

function changeSize(size) {
    context.lineWidth = size;
}

function eraseLastLine() {
    var i = clickDrag.length - 1;
    while (i >= 0) {
        if (!clickDrag[i]) {
            clickX.pop();
            clickY.pop();
            clickDrag.pop();
            clickColor.pop();
            break;
        }
        clickX.pop();
        clickY.pop();
        clickDrag.pop();
        clickColor.pop();
        i = clickDrag.length - 1;
    }

    redraw();
}

function clearCanvas() {
    clickColor = [];
    clickDrag = [];
    clickX = [];
    clickY = [];
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
}

function newGame() {
    gameStarted = true;

    setGame();
    clearCanvas();

    //set client vote counts
    for (let player of players) {
        clientVoteCounts[player.id] = 0;
    }

    setVoteCounts(clientVoteCounts);
    setInstructionText();
    setSubmitButton();
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

        context.lineWidth = 10;
        context.strokeStyle = clickColor[i];

        context.stroke();
    }
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

    var theX = 0;
    var theY = 0;
    if (evt.type === "touchstart" || evt.type === "touchmove") {
        var clientX = evt.changedTouches[0].clientX;
        var clientY = evt.changedTouches[0].clientY;

        theX = (clientX - rect.left) * scaleX;
        theY = (clientY - rect.top) * scaleY;
    }
    else if (evt.type === "mousedown" || evt.type === "mousemove") {
        theX = (evt.clientX - rect.left) * scaleX;
        theY = (evt.clientY - rect.top) * scaleY;
    }

    return {
        x: theX,   // scale mouse coordinates after they have
        y: theY     // been adjusted to be relative to element
    }
}

function selectChoice(choice) {
    var choiceButtons = document.getElementsByClassName('choice');
    var selectedChoiceButton = document.getElementById(choice);
    if (selectedChoiceButton.classList.contains('selected-choice')) {
        selectedChoiceButton.classList.remove('selected-choice');
        currentSelectedChoice = null;
        return;
    }

    for (var button of choiceButtons) {
        if (button.classList.contains('selected-choice')) {
            button.classList.remove('selected-choice');
        }
    }

    selectedChoiceButton.classList.add('selected-choice');
    currentSelectedChoice = choice;
}


$(document).ready(function () {

    /* ======== CANVAS ======== */
    canvas = document.getElementById('the-board');
    if (canvas) {
        console.log("Canvas loaded.")
    }
    // 16:9 ratio
    canvas.width = 1920;
    canvas.height = 1080;
    context = canvas.getContext('2d');

    context.strokeStyle = currentColor;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    function handleStart(evt) {
        evt.preventDefault();

        var mouseX = getMousePos(canvas, evt).x;
        var mouseY = getMousePos(canvas, evt).y;

        if ((evt.which == 1 || evt.type === "touchstart") && isArtist) {
            paint = true;
            addClick(mouseX, mouseY, false);
            redraw();
        }
    }

    function handleMove(evt) {
        evt.preventDefault();

        var mouseX = getMousePos(canvas, evt).x;
        var mouseY = getMousePos(canvas, evt).y;

        if (paint && isArtist) {
            addClick(mouseX, mouseY, true);
            redraw();
        }
    }

    function handleEnd(evt) {
        evt.preventDefault();

        if ((evt.which == 1 || evt.type === "touchend" || evt.type === "touchcancel") && isArtist && paint) {
            var minimumLineLength = 5;
            var tooShort = false;
            for (var i = 1; i <= minimumLineLength; i++) {
                if (!clickDrag[clickDrag.length - i]) {
                    eraseLastLine();
                    tooShort = true;
                }
            }
            if (tooShort) {
                var xpos = evt.pageX - canvas.offsetLeft;
                var ypos = evt.pageY - canvas.offsetTop;
                createNotice(xpos, ypos, 'Your line is too short.');
            }
            else {
                redrawServer();
                nextPlayerServer();
            }
            paint = false;
        }
    }

    canvas.addEventListener('mousedown', handleStart, false);
    canvas.addEventListener('touchstart', handleStart, false);

    canvas.addEventListener('mousemove', handleMove, false);
    canvas.addEventListener('touchmove', handleMove, false);

    canvas.addEventListener('mouseup', handleEnd, false);
    canvas.addEventListener('touchend', handleEnd, false);

    canvas.addEventListener('mouseleave', handleEnd, false);
    canvas.addEventListener('touchcancel', handleEnd, false);

    // New Game button
    var newGameButton = document.getElementById('new-game');
    newGameButton.onclick = endGame;

});

$(window).resize(function () {
    if (canvas) {
        redraw();
    }
});
