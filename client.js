const socket = io('http://localhost:3000');

var chatInput = null;// = document.querySelector('.chatMessage');
var messages = null;// = document.querySelector('.messages');
var changeUsername = null;
var changeUsernameOverlay = null;

var clientObject = null;

/* Functions which emit messages to the server */

function createHTMLMessage(msg, source, username = '') {
    var li = document.createElement("li");
    var div = document.createElement("div");
    if (source == 'info') {
        div.innerHTML = msg;
        div.className += "messageInstance " + source;
    }
    else if (source == 'client') {
        div.innerHTML = clientObject.username + ": " + msg;
        div.className += "messageInstance " + source;
    }
    else {
        div.innerHTML = username + ": " + msg;
        div.className += "messageInstance " + source;
    }
    li.appendChild(div);
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
}

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

// want to move out of this file possibly

$(document).ready(function () {
    chatInput = document.getElementById('chatMessage');
    messages = document.getElementById('messages')

    chatInput.addEventListener('keypress', function (e) {
        // socket.emit('typing');
        var key = e.which || e.keyCode;
        if (key === 13) {
            createHTMLMessage(chatInput.value, 'client'); // Create a message from the client
            socket.emit('chat', chatInput.value, 'client'); // send message to server
            chatInput.value = '';
        }
    });

    changeUsernameButton = document.getElementById('change-username-button');
    changeUsernameOverlay = document.getElementById('change-username-overlay');
    changeUsernameInput = document.getElementById('change-username-input');
    changeUsernameButton.onclick = () => {
        changeUsernameOverlay.style.display = 'block';
    }
    document.getElementById('change-username-overlay-close').onclick = () => {
        changeUsernameOverlay.style.display = 'none';
    }
    changeUsernameInput.addEventListener('keypress', function (e) {
        var key = e.which || e.keyCode;
        if (key === 13) {
            createHTMLMessage(`${clientObject.username} has changed their name to ${changeUsernameInput.value}.`, 'info'); // Create a message for client side
            socket.emit('chat', `${clientObject.username} has changed their name to ${changeUsernameInput.value}.`, 'info'); // Create a message for server
            clientObject.username = changeUsernameInput.value; // change username on client side
            socket.emit('change username', { username: changeUsernameInput.value }); // change username on server side
            changeUsernameOverlay.style.display = 'none';
        }
    });
});


/* =========== Event Listeners =========== */

/* ------ Start game ------- */
socket.on('start game on client', function(serverItem, serverPlayers, artThiefId, serverChoices) {
    players = serverPlayers;
    item = serverItem;
    choices = serverChoices;

    if (clientObject.id === artThiefId) {
        isArtThief = true;
    }
    else {
        isArtThief = false;
    }

    setLeftSidebarGame();
    setUsersDiv();
    boardOverlay.style.display = 'none';
    newGame();
});

socket.on('load users', function(serverPlayers, serverAudience) {
    players = serverPlayers;
    audience = serverAudience;
    setUsersDiv();
});

socket.on('load for audience', function() {
    boardOverlay.style.opacity = 0;
    var boardOverlayContent = document.getElementById("board-overlay-content");
    boardOverlayContent.style.display = 'none';
    var waitForFinish = "Please wait for the current game to finish."
    $(leftSidebar).append(waitForFinish);
});

/* ------ Set the artist (whose turn) ------- */
socket.on('set artist', function(serverPlayerIndex, serverPlayer, serverColor) {
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
socket.on('redraw', function(newClickX, newClickY, newClickColor, newClickDrag) {
    clickX = newClickX;
    clickY = newClickY;
    clickColor = newClickColor;
    clickDrag = newClickDrag;
    console.log(clickX);
    redraw();
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

socket.on('disconnect msg', function (username, serverPlayers, serverAudience) {
    createHTMLMessage(`${username} has left the chatroom.`, 'info');
    //removePlayer(username);
    players = serverPlayers;
    audience = serverAudience;
    setUsersDiv();
})

// socket.on('typing', (data) => {
//     createHTMLMessage(`${username} is typing.`, 'info');
// })