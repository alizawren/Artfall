/* The purpose of this file is to connect pass messages between the client and the server. */

// const socket = io('http://54.67.88.29:3000');
const socket = io('http://localhost:3000');

var chatInput = null;// = document.querySelector('.chatMessage');
var messages = null;// = document.querySelector('.messages');
var changeUsername = null;
var changeUsernameOverlay = null;

var clientObject = null;

/* Functions which emit messages to the server */



function startGameInServer() {
    // do an error check for number of players
    if (players.length < 3) {
        createNotice(50, 0, 'You need at least 3 players to start the game.');
        return;
    }
    socket.emit('start game');
}

function redrawServer() {
    socket.emit('redraw', clickX, clickY, clickColor, clickDrag);
}

function nextPlayerServer() {
    socket.emit('next player');
}

function submitVote(itemChoice, isArtThief) {
    console.log('submitted vote');
    socket.emit('player voted', isArtThief, itemChoice);
}




/* =========== Event Listeners =========== */

/* ------ Start game ------- */
socket.on('start game on client', function (serverItem, serverPlayers, artThiefId, serverChoices, whoStartedGame) {
    players = serverPlayers;
    item = serverItem;

    createHTMLMessage(`${whoStartedGame.username} has started the game.`, 'info');

    if (clientObject.id === artThiefId) {
        isArtThief = true;
        choices = serverChoices;
    }
    else {
        isArtThief = false;
        choices = [];
        for (let player of serverPlayers) {
            if (!(player.id == clientObject.id)) {
                choices.push(player);
            }
        }
    }

    setGame();
    setUsersDiv(players, audience);
    boardOverlay.style.display = 'none';
    newGame();
});

socket.on('load users', function (serverPlayers, serverAudience) {
    players = serverPlayers;
    audience = serverAudience;
    setUsersDiv(players, audience);
    if (gameStarted) {
        setArtist();
    }
});

socket.on('update choices', function (serverPlayers, serverChoices) {
    if (isArtThief) {
        choices = serverChoices;
    } else {
        choices = [];
        for (let player of serverPlayers) {
            if (!player.id == clientObject.id) {
                choices.push(player);
            }
        }
        for (const item of choices) {
            let newChoiceButton = document.getElementById('' + item.id);
            newChoiceButton.innerHTML = item.username;
        }
    }
});

socket.on('load for audience', function () {
    boardOverlay.style.opacity = 0;
    var boardOverlayContent = document.getElementById("board-overlay-content");
    boardOverlayContent.style.display = 'none';
    var waitForFinish = "Please wait for the current game to finish."
    $(leftSidebar).append(waitForFinish);
});

/* ------ Set the artist (whose turn) ------- */
socket.on('set artist', function (serverPlayerIndex, serverPlayer, serverColor) {
    currentPlayerIndex = serverPlayerIndex;
    currentPlayer = serverPlayer;
    currentColor = serverColor;

    if (clientObject.id === serverPlayer.id) {
        console.log(clientObject.username + ' is the current artist.')
        isArtist = true;
    }
    else {
        console.log('Not artist.');
        isArtist = false;
    }

    setArtist()
});

/* ------ Redraw ------- */
socket.on('redraw', function (newClickX, newClickY, newClickColor, newClickDrag) {
    clickX = newClickX;
    clickY = newClickY;
    clickColor = newClickColor;
    clickDrag = newClickDrag;
    redraw();
});

socket.on('end game on client', function (isArtThief, didWin) {
    setMenu();
    //send chat message that says the game has ended or something
    gameStarted = false;
    if (isArtThief) {
        if (didWin) {
            endGameMessage.innerHTML = 'The Art Thief Won! They guessed the word correctly!';
        } else {
            endGameMessage.innerHTML = 'The Art Thief Lost! They guessed the word incorrectly!';
        }
    } else {
        if (didWin) {
            endGameMessage.innerHTML = 'The Players Won! They guessed the Art Thief correctly!';
        } else {
            endGameMessage.innerHTML = 'The Players Lost! They guessed the Art Thief incorrectly!';
        }
    }
});
socket.on('tie', function () {
    var extraText = document.getElementById('extra-text');
    extra.innerHTML = 'There\'s a tie! Someone must switch their vote';
});
socket.on('update votes', function (voteCounts) {
    clientVoteCounts = voteCounts;
    setVoteCounts(clientVoteCounts);

});
socket.on('client connect msg', function (serverClientObject) {
    clientObject = serverClientObject;
    console.log(clientObject.username);
    createHTMLMessage(`You have entered the chatroom as ${clientObject.username}.`, 'info');
    //addPlayer(username);
});

socket.on('connect msg', function (username) {
    createHTMLMessage(`${username} has entered the chatroom.`, 'info');
    //addPlayer(username);
});

socket.on('chat msg', function (msg, source, username) {
    createHTMLMessage(msg, source, username); // Create a message from the server
});

socket.on('disconnect msg', function (username, partOfGame) {
    createHTMLMessage(`${username} has left the chatroom.`, 'info');
    //removePlayer(username);
    // players = serverPlayers;
    // audience = serverAudience;
    if (partOfGame) {
        gameStarted = false;
        setMenu();
    }

    // setUsersDiv();
})
// socket.on('player disconnected', function () {
//     gameStarted = false;
//     setMiddleAreaMenu();
//     setLeftSidebarMenu();
//     setUsersDiv();
// });
// socket.on('typing', (data) => {
//     createHTMLMessage(`${username} is typing.`, 'info');
// })

socket.on('disconnect', function () {
    alert('Server disconnected.');
    createHTMLMessage('The server has disconnected. :(', 'info');
})
