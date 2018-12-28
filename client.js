var chatInput = null;// = document.querySelector('.chatMessage');
var messages = null;// = document.querySelector('.messages');
var changeUsername = null;
var changeUsernameOverlay = null;

function createHTMLMessage(msg, source) {
    var li = document.createElement("li");
    var div = document.createElement("div");
    if (source == 'info') {
        div.innerHTML = msg;
        div.className += "messageInstance " + source;
    }
    else if (source == 'client') {
        div.innerHTML = "You: " + msg;
        div.className += "messageInstance " + source;
    }
    else {
        div.innerHTML = source + ": " + msg;
        div.className += "messageInstance " + 'server';
    }
    li.appendChild(div);
    messages.appendChild(li);
}

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
            let name = 'Sammy';
            createHTMLMessage(`${name} has changed their name to ${changeUsernameInput.value}.`, 'info'); // Create a message for client side
            socket.emit('chat', `${name} has changed their name to ${changeUsernameInput.value}.`, 'info'); // Create a message for server
            socket.emit('change username', {username: changeUsernameInput.value}); // change username
            changeUsernameOverlay.style.display = 'none';
        }
    });
});
const socket = io('http://localhost:3000');

socket.on('connect', function () {
    socket.emit('join', 'Hello server from client');
})

socket.on('connect msg', function (username) {
    createHTMLMessage(`${username} has entered the chatroom.`, 'info');
});

socket.on('chat msg', function (msg, source) {
    createHTMLMessage(msg, source); // Create a message from the server
});

socket.on('disconnect msg', function (username) {
    createHTMLMessage(`${username} has left the chatroom.`, 'info');
})

// socket.on('typing', (data) => {
//     createHTMLMessage(`${username} is typing.`, 'info');
// })