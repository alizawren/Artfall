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
    for(let player of players){
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

    return {
        x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
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

    $(canvas).mousedown(function (e) {
        var mouseX = getMousePos(canvas, e).x;
        var mouseY = getMousePos(canvas, e).y;

        if (e.which == 1 && isArtist) {
            paint = true;
            addClick(mouseX, mouseY, false);
            redraw();
        }

    });

    $(canvas).mousemove(function (e) {
        var mouseX = getMousePos(canvas, e).x;
        var mouseY = getMousePos(canvas, e).y;

        if (paint && isArtist) {
            addClick(mouseX, mouseY, true);
            redraw();
        }
    });

    $(canvas).mouseup(function (e) {
        if (e.which == 1 && isArtist) {
            var minimumLineLength = 5;
            var tooShort = false;
            for (var i = 1; i <= minimumLineLength; i++) {
                if (!clickDrag[clickDrag.length - i]) {
                    eraseLastLine();
                    tooShort = true;
                }
            }
            if (tooShort) {
                var xpos = e.pageX - canvas.offsetLeft;
                var ypos = e.pageY - canvas.offsetTop;
                createNotice(xpos, ypos, 'Your line is too short.');
            }
            else {
                redrawServer();
                nextPlayerServer();
            }
            paint = false;
        }

    });

    $(canvas).mouseleave(function (e) {
        if (e.which == 1 && isArtist) {
            var minimumLineLength = 5;
            var tooShort = false;
            for (var i = 1; i <= minimumLineLength; i++) {
                if (!clickDrag[clickDrag.length - i]) {
                    eraseLastLine();
                    tooShort = true;
                }
            }
            if (tooShort) {
                var xpos = e.pageX - canvas.offsetLeft;
                var ypos = e.pageY - canvas.offsetTop;
                createNotice(xpos, ypos, 'Your line is too short.');
            }
            else {
                redrawServer();
                nextPlayerServer();
            }
            paint = false;
        }
    });
    

    // Mobile
    // canvas.addEventListener('touchstart', function(e) {
    //     var mouseX = getMousePos(canvas, e).x;
    //     var mouseY = getMousePos(canvas, e).y;

    //     if (e.which == 1 && isArtist) {
    //         paint = true;
    //         addClick(mouseX, mouseY, false);
    //         redraw();
    //     }
    // }, false);
    // canvas.addEventListener('touchmove', function(e) {
    //     var mouseX = getMousePos(canvas, e).x;
    //     var mouseY = getMousePos(canvas, e).y;

    //     if (paint && isArtist) {
    //         addClick(mouseX, mouseY, true);
    //         redraw();
    //     }
    // }, false);
    // canvas.addEventListener('touchend', function(e) {
    //     if (e.which == 1 && isArtist) {
    //         var minimumLineLength = 5;
    //         var tooShort = false;
    //         for (var i = 1; i <= minimumLineLength; i++) {
    //             if (!clickDrag[clickDrag.length - i]) {
    //                 eraseLastLine();
    //                 tooShort = true;
    //             }
    //         }
    //         if (tooShort) {
    //             var xpos = e.pageX - canvas.offsetLeft;
    //             var ypos = e.pageY - canvas.offsetTop;
    //             createNotice(xpos, ypos, 'Your line is too short.');
    //         }
    //         else {
    //             redrawServer();
    //             nextPlayerServer();
    //         }
    //         paint = false;
    //     }
    // }, false);

    // $(canvas).bind('touchstart', function(e){
    //     var mouseX = getMousePos(canvas, e).x;
    //     var mouseY = getMousePos(canvas, e).y;

    //     if (e.which == 1 && isArtist) {
    //         paint = true;
    //         addClick(mouseX, mouseY, false);
    //         redraw();
    //     }
    // }).bind('touchstart', function(){
    //     var mouseX = getMousePos(canvas, e).x;
    //     var mouseY = getMousePos(canvas, e).y;

    //     if (paint && isArtist) {
    //         addClick(mouseX, mouseY, true);
    //         redraw();
    //     }
    // }).bind('touchend', function(){
    //     if (e.which == 1 && isArtist) {
    //         var minimumLineLength = 5;
    //         var tooShort = false;
    //         for (var i = 1; i <= minimumLineLength; i++) {
    //             if (!clickDrag[clickDrag.length - i]) {
    //                 eraseLastLine();
    //                 tooShort = true;
    //             }
    //         }
    //         if (tooShort) {
    //             var xpos = e.pageX - canvas.offsetLeft;
    //             var ypos = e.pageY - canvas.offsetTop;
    //             createNotice(xpos, ypos, 'Your line is too short.');
    //         }
    //         else {
    //             redrawServer();
    //             nextPlayerServer();
    //         }
    //         paint = false;
    //     }
    // });

    // New Game button
    var newGameButton = document.getElementById('new-game');
    newGameButton.onclick = endGame;

});

$(window).resize(function () {
    if (canvas) {
        redraw();
    }
});
