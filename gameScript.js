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
var audience = [];

// game variables
var item;
var isArtThief = false;
var isArtist = false;
var choices = [];

//const colors = { 'Blue': '#0f6cb6', 'Red': '#b32017', 'Green': '#81b909', 'Orange': '#ea7f1e', 'Teal': '#00b1b0' };
const playerColors = ['#27a4dd', '#f1646c', '#fac174', '#8cdfc0', '#fd7db0'];
const playerColorOutlines = ['#2564a9', '#e63d53', '#ee7659', '#968293', '#e85f95']

var currentPlayer = '';
var currentColor = '#000';

var currentSelectedChoice;

function addClick(x, y, dragging) {
    clickX.push(x);
    clickY.push(y);
    clickDrag.push(dragging);
    clickColor.push(currentColor);
}

// Button functions
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
    clearCanvas();

    context.strokeStyle = currentColor;

    // update instruction text
    var instructionText = document.getElementById('instruction-text');
    var voteInstructionText = document.getElementById('vote-instructions');
    if (!isArtThief) { // later replace with (not the art thief)
        instructionText.innerHTML = `The word is "${item}."`;
        voteInstructionText.innerHTML = "Guess the Art Thief's identity.";
    }
    else {
        instructionText.innerHTML = `You are the Art Thief!`;
        voteInstructionText.innerHTML = "You have one try to guess the item. When you click Submit, the game ends.";
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

}

function setArtist() {

    // update "It's __'s turn!"
    var currentPlayerText = document.getElementById('current-player');
    if (isArtist) {
        currentPlayerText.innerHTML = "your";
    }
    else {
        currentPlayerText.innerHTML = currentPlayer.username + "'s";
    }

    // update bolded text
    var playerTexts = document.getElementsByClassName('player-info');
    for (var player of playerTexts) {
        if (player.classList.contains('bolded-player')) {
            player.classList.remove('bolded-player');
        }
    }
    playerTexts[currentPlayerIndex].classList.add('bolded-player');
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


// if you want an element centered, pass in 0 for ypos
function createNotice(xpos, ypos, message) {
    var notice = document.createElement('div');
    notice.classList.add('notice');
    notice.innerHTML = message;
    notice.style.left = xpos + 'px';
    notice.style.top = ypos + 'px';
    notice.style.opacity = 0.9;

    var contentDiv = document.getElementById('content');
    contentDiv.appendChild(notice);

    // center element
    if (ypos === 0) {
        notice.style.left = '50%';
        notice.style.marginLeft = -(notice.offsetWidth / 2);
    } 

    setTimeout(function () {
        var interval = setInterval(function () {
            if (notice.style.opacity <= 0) {
                clearInterval(interval);
                contentDiv.removeChild(notice);
            }
            notice.style.opacity -= 0.1;
        }, 50);
    }, 1000);
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
        if (isArtist) {
            paint = false;
        }
    });

    // New Game button
    var newGameButton = document.getElementById('new-game');
    newGameButton.onclick = backToMenu;

});

$(window).resize(function () {
    if (canvas) {
        redraw();
    }
});
