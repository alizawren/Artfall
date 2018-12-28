var canvas = null;
var context = null;

var clickX = [];
var clickY = [];
var clickDrag = [];
var clickColor = [];
var paint;

// var numPlayers = 4;
// var players = ['Sammy', 'Whammy', 'Grammy', 'Cammy'];
var numPlayers = 0;
var players = [];

// const choices = ['apple', 'pear', 'orange', 'banana', 'watermelon', 'guava', 'kiwi', 'strawberry', 'grapes'];
const choices = ['funny', 'lousy', 'careful', 'lazy', 'playing', 'escalator', 'weights', 'monalisa', 'bartender', 'lunar', 'looking', 'discarding'];

var itemIndex = Math.floor(Math.random() * choices.length);
var item = choices[itemIndex];


//const colors = { 'Blue': '#0f6cb6', 'Red': '#b32017', 'Green': '#81b909', 'Orange': '#ea7f1e', 'Teal': '#00b1b0' };
const playerColors = ['#27a4dd', '#f1646c', '#fac174', '#9dd5c0', '#f39cc3'];
const playerColorOutlines = ['#2564a9', '#e63d53', '#ee7659', '#968293', '#e85f95']

var currentPlayer = 0;
var currColor = 0;

var currentSelectedChoice;

function addClick(x, y, dragging) {
    //console.log('add click,' + x + ',' + y + ',' + dragging);
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(dragging);
    clickColor.push(currColor);
}

// Button functions
function changeColor(colour) {
    currColor = colour;
}

function changeSize(size) {
    context.lineWidth = size;
}

function eraseLastLine() {
    console.log(clickDrag.length);
    console.log(clickColor.length);
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
    console.log(clickDrag);
    console.log(clickColor);
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
    clearCanvas();
    currentPlayer = 0;
    currColor = playerColors[currentPlayer];

    // Get players from server

    // update "It's __'s turn!"
    var currentPlayerText = document.getElementById('current-player');
    currentPlayerText.innerHTML = players[currentPlayer];

    // update bold text
    var playerTexts = document.getElementsByClassName('player-info');
    playerTexts[currentPlayer].classList.add('bolded-player');

    context.strokeStyle = playerColors[0];

    // choose a new item
    itemIndex = Math.floor(Math.random() * choices.length);
    item = choices[itemIndex];

    // update instruction text
    var instructionText = document.getElementById('instruction-text');
    if (true) { // later replace with (not the art thief)
        instructionText.innerHTML = `The word is "${item}."`;
    }
    else {
        instructionText.innerHTML = `You are the Art Thief!`;
    }

}

function backToMenu() {

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

function nextPlayer() {
    currentPlayer = (currentPlayer + 1) % numPlayers;
    currColor = playerColors[currentPlayer];
    console.log('stroke style is now: ' + currColor)

    // update "It's __'s turn!"
    var currentPlayerText = document.getElementById('current-player');
    currentPlayerText.innerHTML = players[currentPlayer];

    var playerTexts = document.getElementsByClassName('player-info');
    for (var player of playerTexts) {
        if (player.classList.contains('bolded-player')) {
            player.classList.remove('bolded-player');
        }
    }
    playerTexts[currentPlayer].classList.add('bolded-player');
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

    context.strokeStyle = currColor;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    $(canvas).mousedown(function (e) {
        if (e.which == 1) {
            paint = true;
            addClick(mouseX, mouseY, false);
            redraw();
        }
        var mouseX = getMousePos(canvas, e).x;
        var mouseY = getMousePos(canvas, e).y;

    });

    $(canvas).mousemove(function (e) {
        var mouseX = getMousePos(canvas, e).x;
        var mouseY = getMousePos(canvas, e).y;

        if (paint) {
            addClick(mouseX, mouseY, true);
            redraw();
        }
    });

    $(canvas).mouseup(function (e) {
        if (e.which == 1) {

            var minimumLineLength = 5;
            var tooShort = false;
            for (var i = 1; i <= minimumLineLength; i++) {
                if (!clickDrag[clickDrag.length - i]) {
                    eraseLastLine();
                    tooShort = true;
                }
            }
            if (tooShort) {
                var drawALine = document.createElement('div');
                drawALine.classList.add('notice');
                drawALine.innerHTML = 'Your line is too short.';
                var xpos = e.pageX - canvas.offsetLeft;
                var ypos = e.pageY - canvas.offsetTop;
                drawALine.style.left = xpos + 'px';
                drawALine.style.top = ypos + 'px';
                drawALine.style.opacity = 0.9;

                var contentDiv = document.getElementById('content');
                contentDiv.appendChild(drawALine);

                setTimeout(function () {
                    var interval = setInterval(function () {
                        if (drawALine.style.opacity <= 0) {
                            clearInterval(interval);
                            contentDiv.removeChild(drawALine);
                        }
                        drawALine.style.opacity -= 0.1;
                    }, 50);
                }, 1000);
            }
            else {
                console.log('next player')
                nextPlayer();
            }
            paint = false;
        }

    });

    $(canvas).mouseleave(function (e) {
        paint = false;
    });

    /* ========= Buttons ========== */

    // New Game button
    var newGameButton = document.getElementById('new-game');
    newGameButton.onclick = newGame;

    /* ======== Choices ======== */

    var choiceList = document.getElementById('choice-list');
    for (const item of choices) {
        var choiceButton = document.createElement('div');
        choiceButton.classList.add('choice');
        choiceButton.id = item;
        choiceButton.innerHTML = item;
        choiceButton.onclick = function () { selectChoice(item) };

        choiceList.appendChild(choiceButton);
    }

    /* ======== New game ========= */
    backToMenu();
});

$(window).resize(function () {
    if (canvas) {
        redraw();
    }
});
