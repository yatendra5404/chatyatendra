const socket = io(window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : window.location.origin);

const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const userCountSpan = document.getElementById('userCount');

let username = localStorage.getItem('username');
if (!username) {
    username = 'User_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('username', username);
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function addMessage(message, isSent = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;

    const usernameDiv = document.createElement('div');
    usernameDiv.className = 'username';
    usernameDiv.textContent = message.username;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    contentDiv.textContent = message.text;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'time';
    timeDiv.textContent = formatTime(message.timestamp);

    messageDiv.appendChild(usernameDiv);
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    const message = {
        text,
        username,
        timestamp: new Date().toISOString()
    };

    socket.emit('chatMessage', message);
    messageInput.value = '';
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

socket.on('connect', () => {
    sendButton.disabled = false;
    messageInput.disabled = false;
});

socket.on('disconnect', () => {
    sendButton.disabled = true;
    messageInput.disabled = true;
});

socket.on('chatMessage', (message) => {
    addMessage(message, message.username === username);
});

socket.on('userCount', (count) => {
    userCountSpan.textContent = count;
});

socket.on('loadMessages', (messages) => {
    messagesDiv.innerHTML = '';
    messages.forEach(message => {
        addMessage(message, message.username === username);
    });
});