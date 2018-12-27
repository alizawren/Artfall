var inputElem = null;// = document.querySelector('.chatMessage');
var messages = null;// = document.querySelector('.messages');

$( document ).ready(function() {
  inputElem = document.getElementById('chatMessage');
  messages = document.getElementById('messages')
  console.log(inputElem);
});
const socket = io('http://localhost:8000');

function createHTMLMessage(msg,source) {
    console.log(msg);
    var li = document.createElement("li");
    var div = document.createElement("div");
    div.innerHTML += msg;
    div.className += "messageInstance " + source;
    li.appendChild(div);
    messages.appendChild(li);
}

inputElem.addEventListener('keypress', function(e) {
    var key = e.which || e.keyCode;
    if (key === 13) {
        createHTMLMessage(inputElem.value, 'client');
        socket.emit('chat', inputElem.value);
    }
});

socket.on('connect', function(data) {
    socket.emit('join', 'Hello server from client');
});

socket.on('chat msg', function(msg) {
    createHTMLMessage(msg, 'server');
});
