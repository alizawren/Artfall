/* The purpose of this file is to connect pass messages between the client and the server. */

const socket = io('http://54.67.88.29:3000');
// const socket = io('http://localhost:3000');

var clientObject = null;

/* =========== Functions which emit messages to the server =========== */

function startGameInServer() {
    socket.emit('start game');
}

function redrawServer() {
    socket.emit('redraw', clickX, clickY, clickColor, clickDrag);
}

function nextPlayerServer() {
    socket.emit('next player');
}

function submitVote(itemChoice, isArtThief) {
    socket.emit('player voted', isArtThief, itemChoice);
}

function endGame() {
    socket.emit('end game');
}

function toggleAudienceMember(roleChoice) {
    socket.emit('toggle audience member', roleChoice);
}

/* =========== Event Listeners =========== */

/* ------ Start game ------- */
socket.on('start game on client', function (serverItem, artThiefId, whoStartedGame) {
    isArtThief = (clientObject.id === artThiefId);
    if (!isArtThief) {
        item = serverItem;
    }
    createHTMLMessage(`${whoStartedGame.username} has started the game.`, 'info');
    newGame();
});

socket.on('update users', function (serverPlayers, serverAudience) {
    players = serverPlayers;
    audience = serverAudience;
    setUsersDiv();
    if (gameStarted) {
        setArtist();
    }
});

socket.on('update choices', function (serverChoices, artThiefId) {
    /* Get choices for this client */
    if (clientObject.id === artThiefId) {
        choices = serverChoices;
    }
    else {
        choices = [];
        for (let player of players) {
            if (!(player.id == clientObject.id)) {
                choices.push(player);
            }
        }
    }
    setChoices();
});

socket.on('load for audience', function () {
    setForAudience();
});

/* ------ Set the artist (whose turn) ------- */
socket.on('update artist', function (serverPlayerIndex, serverPlayer, serverColor) {
    currentPlayerIndex = serverPlayerIndex;
    currentPlayer = serverPlayer;
    currentColor = serverColor;
    isArtist = (clientObject.id === serverPlayer.id);
    setArtist();
});

/* ------ Redraw ------- */
socket.on('redraw', function (newClickX, newClickY, newClickColor, newClickDrag) {
    clickX = newClickX;
    clickY = newClickY;
    clickColor = newClickColor;
    clickDrag = newClickDrag;
    redraw();
});


socket.on('end game on client', function () {
    setMenu();
    gameStarted = false;
    createHTMLMessage('The game has ended!', 'info');
    clearCanvas();
});
socket.on('end game message', function (isArtThief, didWin, item, itemChoice, artThiefUsername) {
    setEndGame(isArtThief, didWin, item, itemChoice, artThiefUsername);
    createHTMLMessage(`The
                    ${isArtThief ? 'Art Thief ' : 'Players '}
                    ${didWin ? 'Won!' : 'Lost!'} They guessed the
                    ${isArtThief ? 'word' : 'Art Thief'}
                    ${didWin ? 'correctly' : 'incorrectly'}.`,'info');
});
socket.on('tie', function () {
    var extraText = document.getElementById('extra-text');
    extraText.innerHTML = 'There\'s a tie! Someone must switch their vote';
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
    if (partOfGame) {
        gameStarted = false;
        setMenu();
    }
    setUsersDiv();
})

socket.on('disconnect', function () {
    alert('You have been disconnected from the server.');
    createHTMLMessage('You have been disconnected from the server.', 'info'); // Please check Twitter for server status
})
