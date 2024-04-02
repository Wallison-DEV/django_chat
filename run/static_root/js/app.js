let currentRecipient = '';
let chatInput = document.querySelector('#chat-input');
let chatButton = document.querySelector('#btn-send');
let userList = document.querySelector('#user-list');
let messageList = document.querySelector('#messages');
let recipientUser = document.querySelector('.panel-heading')

function updateUserList() {
    fetch('api/v1/user/')
        .then(response => response.json())
        .then(data => {
            while (userList.firstChild) {
                if (userList.firstChild.classList && userList.firstChild.classList.contains('user')) {
                    userList.removeChild(userList.firstChild);
                } else {
                    break;
                }
            }
            for (let i = 0; i < data.length; i++) {
                const userItem = document.createElement('a');
                userItem.classList.add('list-group-item', 'user');
                userItem.textContent = data[i]['username'];
                userList.appendChild(userItem);
                userItem.addEventListener('click', function () {
                    userList.querySelectorAll('.active').forEach(item => item.classList.remove('active'));
                    userItem.classList.add('active');
                    setCurrentRecipient(userItem.textContent);
                });
            }
        })
        .catch(error => console.error('Erro ao obter dados do usuário:', error));
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const dayOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const day = dayOfWeek[date.getDay()];
    const time = `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
    return `${day} ${time}`;
}

function drawMessage(message) {
    let position = 'left';
    const formattedDate = formatTime(message.timestamp);
    if (message.user === currentUser) position = 'right';
    const messageElement = document.createElement('li');
    messageElement.classList.add('message', position);

    messageElement.innerHTML = `
        <div class="avatar">${message.user}</div>
        <div class="text_wrapper">
            <div class="text">${message.body}<br></div>
            <span class="small">${formattedDate}</span>
        </div>
    `;
    messageList.appendChild(messageElement);
}

function getConversation(recipient) {
    fetch(`/api/v1/message/?target=${recipient}`)
        .then(response => response.json())
        .then(data => {
            while (messageList.firstChild) {
                messageList.removeChild(messageList.firstChild);
            }
            data.results.forEach(drawMessage);
            messageList.scrollTop = messageList.scrollHeight;
        })
        .catch(error => console.error('Erro ao obter conversa:', error));
}
function getMessageById(message) {
    const id = JSON.parse(message).message;
    fetch(`/api/v1/message/${id}/`)
        .then(response => response.json())
        .then(data => {
            if (data.user === currentRecipient || (data.recipient === currentRecipient && data.user === currentUser)) {
                drawMessage(data);
            }
            messageList.scrollTop = messageList.scrollHeight;
        })
        .catch(error => console.error('Erro ao obter mensagem por ID:', error));
}


function sendMessage(recipient, body) {
    fetch('/api/v1/message/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            recipient: recipient,
            body: body
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao enviar mensagem');
            }
            getConversation(currentRecipient);
        })
        .catch(error => {
            console.error('Erro ao enviar mensagem:', error);
            alert('Erro! Verifique o console para mais informações.');
        });
}


function setCurrentRecipient(username) {
    currentRecipient = username;
    recipientUser.innerHTML = ''
    let userAvatar = document.createElement('div')
    userAvatar.classList.add('avatar-recipient')
    userAvatar.innerText = currentRecipient
    let userElement = document.createElement('h4');
    userElement.classList.add('panel-title');
    userElement.textContent = currentRecipient;
    recipientUser.appendChild(userAvatar);
    recipientUser.appendChild(userElement);
    getConversation(currentRecipient);
    enableInput();
}

function enableInput() {
    chatInput.disabled = false;
    chatButton.disabled = false;
    chatInput.focus();
}

function disableInput() {
    chatInput.disabled = true;
    chatButton.disabled = true;
}

document.addEventListener('DOMContentLoaded', function () {
    updateUserList();
    disableInput();

    let socket = new WebSocket(`ws://${window.location.host}/ws?session_key=${sessionKey}`);

    socket.onopen = function () {
        socket.send(JSON.stringify({ 'action': 'subscribe' }));
    };

    socket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        if (data.type === 'message') {
            drawMessage(data.message);
        }
    };

    chatInput.addEventListener('keypress', function (e) {
        if (e.keyCode === 13) {
            chatButton.click();
        }
    });

    chatButton.addEventListener('click', function () {
        if (chatInput.value.length > 0) {
            sendMessage(currentRecipient, chatInput.value);
            chatInput.value = '';
        }
    });
});
