/* The purpose of this file is to set front-end elements on the page, regardless of whether the game is running. */

/* ========= Define variables ========== */
// 
var leftSidebar = null;
var boardOverlay = null;

var chatInput = null;
var messages = null;

var changeUsernameButton = null;
var changeUsernameOverlay = null;
var changeUsernameInput = null;
var changeUsernameClose = null;

/* ========= Declare variables ========== */
$(document).ready(function () {
    leftSidebar = document.getElementById("left-sidebar");
    boardOverlay = document.getElementById("board-overlay");
    
    chatInput = document.getElementById('chatMessage');
    messages = document.getElementById('messages')

    changeUsernameButton = document.getElementById('change-username-button');
    changeUsernameOverlay = document.getElementById('change-username-overlay');
    changeUsernameInput = document.getElementById('change-username-input');
    changeUsernameClose = document.getElementById('change-username-overlay-close')

    setMenu()
    setChat();
});


/** Function: This method will set the front-end users based on what is currently stored in the "players" 
 * and "audience" arrays on the client side.
 * Pre-conditions: A div with the id "players" exists. (setLeftSidebarMenu() or setLeftSidebarGame() has been called.)
 * 
 * @param players An array of the players (which contains objects, each with a username field).
 * @param audience An array of the audience (which contains objects, each with a username field).
 */
function setUsersDiv(players, audience) {
    var playerDiv = document.getElementById('players');
    playerDiv.innerHTML = '';
    for (var i = 0; i < players.length; i++) {
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
        playerText.innerHTML = players[i].username;

        //player votes
        var playerVoteCount = document.createElement('span');
        playerVoteCount.classList.add('vote-count');
        playerVoteCount.id = players[i].id + '-votecount';
        playerVoteCount.innerHTML = '';
        playerText.appendChild(playerVoteCount);

        playerInfo.appendChild(playerDotWrapper);
        playerInfo.appendChild(playerText);
        playerDiv.appendChild(playerInfo);

    }

    var audienceDiv = document.getElementById('audience');
    audienceDiv.innerHTML = '';
    for (var i = 0; i < audience.length; i++) {
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
        playerText.innerHTML = audience[i].username;

        playerInfo.appendChild(playerDotWrapper);
        playerInfo.appendChild(playerText);
        audienceDiv.appendChild(playerInfo);
    }
}

/** Function: This method sets the chat.
 * Pre-conditions: The page has loaded.
 */
function setChat() {
    chatInput.addEventListener('keypress', function (e) {
        // socket.emit('typing');
        var key = e.which || e.keyCode;
        if (key === 13) {
            createHTMLMessage(chatInput.value, 'client'); // Create a message from the client
            socket.emit('chat', chatInput.value, 'client'); // send message to server
            chatInput.value = '';
        }
    });

    changeUsernameButton.onclick = () => {
        changeUsernameOverlay.style.display = 'block';
    }

    changeUsernameClose.onclick = () => {
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
}


