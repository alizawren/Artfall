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
    messages = document.getElementById('message-holder')

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
 */
function setUsersDiv() {
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
            createHTMLMessage(chatInput.value, 'client', clientObject.username); // Create a message from the client
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
            var newUsername = changeUsernameInput.value;
            // check if username too long
            if (newUsername.length > 15) {
                createNotice(0,0,'Username may not have more than 15 characters.');
                return;
            }
            createHTMLMessage(`${clientObject.username} has changed their name to ${newUsername}.`, 'info'); // Create a message for client side
            socket.emit('chat', `${clientObject.username} has changed their name to ${newUsername}.`, 'info'); // Create a message for server
            clientObject.username = newUsername; // change username on client side
            socket.emit('change username', { username: newUsername }); // change username on server side
            changeUsernameOverlay.style.display = 'none';
        }
    });
}

/** Function: Creates a message and appends it to the right sidebar
 * Pre-conditions: None.
 * @param {*} msg The message to send
 * @param {*} source Where the message is coming from, 'client', 'server', or 'info'
 * @param {*} username Username of who wrote the message. By default blank (if it came from info)
 */
function createHTMLMessage(msg, source, username = '') {
    var messages = document.getElementById('message-holder');
    var li = document.createElement("li");
    var div = document.createElement("div");
    if (source == 'info') {
        var infoIcon = document.createElement("img");
        infoIcon.classList.add('info-icon');
        infoIcon.src = 'info2.png';
        div.appendChild(infoIcon);
        div.innerHTML += msg;
        div.className += "messageInstance " + source;
    }
    else if (source == 'client') {
        div.innerHTML = username + ": " + msg;
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

/** Function: Creates a notice message.
 * Pre-conditions: None.
 * @param xpos The x-position of the message relative to the screen.
 * @param ypos The y-position of the message relative to the screen. If 0 is passed in, then the element will automatically 
 * be centered horizontally at the top of the screen.
 * @param message The message to display.
 */
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