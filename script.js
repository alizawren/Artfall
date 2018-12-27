var canvas = null;
var context = null;

var clickX = [];
var clickY = [];
var clickDrag = [];
var clickColor = [];
var paint;

var numPlayers = 4;
const players = ['Sammy', 'Whammy', 'Grammy', 'Cammy'];

// const choices = ['apple', 'pear', 'orange', 'banana', 'watermelon', 'guava', 'kiwi', 'strawberry', 'grapes'];
const choices = ['funny', 'lousy', 'careful', 'lazy', 'drunk', 'playing', 'escalator', 'weights', 'monalisa', 'murderer', 'drinker', 'bartender', 'lunar', 'tricking', 'looking', 'hurting', 'killing', 'discarding'];

const colors = { 'Blue': '#0f6cb6', 'Red': '#b32017', 'Green': '#81b909', 'Orange': '#ea7f1e', 'Teal': '#00b1b0' };
const playerColors = ['#27a4dd', '#f1646c', '#fac174', '#9dd5c0', '#f39cc3'];
const playerColorOutlines = ['#2564a9', '#e63d53', '#ee7659', '#968293', '#e85f95']

var currentPlayer = 0;

var currentSelectedChoice;

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

function newGame() {
    clearCanvas();
    currentPlayer = 0;

    // update "It's __'s turn!"
    var currentPlayerText = document.getElementById('current-player');
    currentPlayerText.innerHTML = players[currentPlayer];

    // update bold text
    var playerTexts = document.getElementsByClassName('player-info');
    playerTexts[currentPlayer].classList.add('bolded-player');

    context.strokeStyle = playerColors[0];
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
    context.strokeStyle = playerColors[currentPlayer];

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

    context.strokeStyle = playerColors[0];
    context.lineCap = 'round';
    context.lineJoin = 'round';

    $(canvas).mousedown(function (e) {
        var mouseX = getMousePos(canvas, e).x;
        var mouseY = getMousePos(canvas, e).y;

        paint = true;
        addClick(mouseX, mouseY, false);
        redraw();
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
        paint = false;
        nextPlayer();
    });

    $(canvas).mouseleave(function (e) {
        paint = false;
    });

    /* ========= Buttons ========== */

    // Clear button
    var newGameButton = document.getElementById('new-game');
    newGameButton.onclick = newGame;

    // Color buttons
    // const colors = { 'Blue': 'blue', 'Red': '#df4b26', 'Green': 'green' };
    // var colorButtonRow = document.getElementById('color-button-row');
    // for (const color in colors) {
    //     var colorButton = document.createElement('button');
    //     colorButton.classList.add('color-button');
    //     colorButton.innerHTML = color;
    //     colorButton.onclick = function () { getColor(colors[color]) };

    //     colorButtonRow.appendChild(colorButton);
    // }

    // Size buttons
    // const sizes = { 'Small': 2, 'Medium': 5, 'Large': 10, 'XL': 20 };
    // var sizeButtonRow = document.getElementById('size-button-row');
    // for (const size in sizes) {
    //     var sizeButton = document.createElement('button');
    //     sizeButton.classList.add('size-button');
    //     sizeButton.innerHTML = size;
    //     sizeButton.onclick = function () { getSize(sizes[size]) };

    //     sizeButtonRow.appendChild(sizeButton);
    // }

    /* ======== PLAYERS ======== */

    var playerDiv = document.getElementById('players');
    for (var i = 0; i < numPlayers; i++) {
        var playerInfo = document.createElement('span');
        playerInfo.classList.add('player-info');

        // player dot
        var playerDotWrapper = document.createElement('span');
        var playerDot = document.createElement('div');
        playerDot.classList.add('player-dot');
        playerDot.style.backgroundColor = playerColors[i];
        playerDot.style.border = `1px solid ${playerColorOutlines[i]}`;
        playerDotWrapper.appendChild(playerDot);

        // player text
        var playerText = document.createElement('span');
        playerText.innerHTML = players[i];

        playerInfo.appendChild(playerDotWrapper);
        playerInfo.appendChild(playerText);
        playerDiv.appendChild(playerInfo);
    }

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
    newGame();
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
