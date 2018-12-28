var chatInput = null;// = document.querySelector('.chatMessage');
var messages = null;// = document.querySelector('.messages');
var changeUsername = null;
var changeUsernameOverlay = null;

var clientUsername = 'Anonymous';

function createHTMLMessage(msg, source, username = '') {
    var li = document.createElement("li");
    var div = document.createElement("div");
    if (source == 'info') {
        div.innerHTML = msg;
        div.className += "messageInstance " + source;
    }
    else if (source == 'client') {
        div.innerHTML = clientUsername + ": " + msg;
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
            createHTMLMessage(`${clientUsername} has changed their name to ${changeUsernameInput.value}.`, 'info'); // Create a message for client side
            socket.emit('chat', `${clientUsername} has changed their name to ${changeUsernameInput.value}.`, 'info'); // Create a message for server
            clientUsername = changeUsernameInput.value; // change username on client side
            socket.emit('change username', { username: changeUsernameInput.value }); // change username on server side
            changeUsernameOverlay.style.display = 'none';
        }
    });
});
const socket = io('http://localhost:3000');

socket.on('client connect msg', function (username) {
    clientUsername = username;
    console.log(clientUsername);
    createHTMLMessage(`You have entered the chatroom as ${clientUsername}.`, 'info');

});

socket.on('connect msg', function (username) {
    createHTMLMessage(`${username} has entered the chatroom.`, 'info');
});

socket.on('chat msg', function (msg, source, username) {
    createHTMLMessage(msg, source, username); // Create a message from the server
});

socket.on('disconnect msg', function (username) {
    createHTMLMessage(`${username} has left the chatroom.`, 'info');
})

// socket.on('typing', (data) => {
//     createHTMLMessage(`${username} is typing.`, 'info');
// })