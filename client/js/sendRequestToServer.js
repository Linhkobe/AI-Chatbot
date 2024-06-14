import { getImageFromDallE } from './dallE.js';

const endpointURL = 'http://localhost:3001/chat';

let outputElement, submitButton, inputElement, historyElement, chatContainer, inputTypeElement;
let chatCounter = 0;
let currentChatId = null;
let chatSessions = [];

window.onload = init;

window.newChat = function() {
    chatCounter++;
    const newChatId = 'chat' + chatCounter; 
    currentChatId = newChatId;

    chatSessions.push({ id: newChatId, messages: [] });

    const chatButton = document.createElement('button');
    chatButton.className = 'chat-button'; 
    chatButton.id = newChatId + '-button';
    chatButton.onclick = () => showChat(newChatId); 
    chatButton.innerText = 'Chat ' + chatCounter;
    document.getElementById('chat-buttons-container').appendChild(chatButton);
    chatContainer.innerHTML = '';
}

window.showChat = function showChat(chatId) {
    const chatSession = chatSessions.find(session => session.id === chatId);
    console.log("Current chat session ID:", chatId);

    if (chatSession) {
        chatContainer.innerHTML = '';

        chatSession.messages.forEach(message => {
            appendMessage(message);
        });

        currentChatId = chatId;
    }
}

function init() {
    outputElement = document.querySelector('#output');
    submitButton = document.querySelector('#submit');
    submitButton.onclick = getMessage;

    inputElement = document.querySelector('input');
    inputTypeElement = document.querySelector('#input-type');
    inputElement.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            getMessage();
        }
    }); 
    historyElement = document.querySelector('.history');
    chatContainer = document.querySelector('.chat-container');

    newChat();
}

async function getMessage() {
    let prompt = inputElement.value.trim();
    let selectedOption = inputTypeElement.value;

    if (!prompt) return;

    if (selectedOption !== 'none') {
        prompt = `${selectedOption} ${prompt}`;
    }

    const chatSession = chatSessions.find(session => session.id === currentChatId);

    if (chatSession) {
        const userMessage = { sender: 'user', content: `You: ${prompt}`, type: 'text' };
        chatSession.messages.push(userMessage);
        appendMessage(userMessage);

        if (chatSession.messages.length === 1) {
            const chatButton = document.getElementById(currentChatId + '-button');
            if (chatButton) chatButton.textContent = prompt;
        }

        inputElement.value = '';

        if (prompt.startsWith('/image')) {
            const imagePrompt = prompt.slice(6).trim();
            const images = await getImageFromDallE(imagePrompt);
            images.data.forEach(imageObj => {
                const imageMessage = { sender: 'bot', content: imageObj.url, type: 'image' };
                chatSession.messages.push(imageMessage);
                appendMessage(imageMessage);
            });
        } else if (prompt.startsWith('/stable')) {
            const stablePrompt = prompt.slice(8).trim();
            console.log("Sending request to Stable Diffusion with prompt:", stablePrompt);
            const response = await getStableDiffusionResponse(stablePrompt);
            console.log("Stable Diffusion response received:", response);
            if (response && response.url) {
                const imageMessage = { sender: 'bot', content: response.url, type: 'image' };
                console.log("Stable Diffusion image URL:", response.url);
                chatSession.messages.push(imageMessage);
                appendMessage(imageMessage);
            }
        } else if (prompt.startsWith('/speech')) {
            const response = await getResponseFromServer(prompt);
            if (response) {
                const audioMessage = { sender: 'bot', content: response, type: 'audio' };
                chatSession.messages.push(audioMessage);
                appendMessage(audioMessage);
            }
        } else {
            const response = await getResponseFromServer(prompt);
            if (response) {
                const botMessage = { sender: 'bot', content: response, type: 'text' };
                chatSession.messages.push(botMessage);
                appendMessage(botMessage);
            }
        }
    }
}
async function getResponseFromServer(prompt) {
    try {
        const formData = new FormData();
        formData.append('prompt', prompt);

        const response = await fetch(endpointURL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        if (prompt.startsWith('/speech')) {
            const audio = await response.blob();
            const audioUrl = URL.createObjectURL(audio);
            return audioUrl;
        }

        const data = await response.json();
        return data.choices ? data.choices[0].message.content : '';
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, something went wrong. Please try again.';
    }
}

async function getStableDiffusionResponse(prompt) {
    try {
        const formData = new FormData();
        formData.append('prompt', prompt);

        console.log("Sending request to /stable endpoint with prompt:", prompt);
        const response = await fetch('http://localhost:3001/stable', {
            method: 'POST',
            body: formData,
        });

        console.log("Received response from /stable endpoint:", response);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Stable Diffusion data:", data);
        return data; // Ensure that this is an object with an 'url' property
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, something went wrong. Please try again.';
    }
}

function appendMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', message.sender);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('content');
    messageDiv.appendChild(contentDiv);

    if (message.sender === 'user') {
        messageDiv.classList.add('user-message');
    } else if (message.sender === 'bot') {
        messageDiv.classList.add('bot-message');
    }

    if (message.type === 'image') {
        const imgElement = document.createElement('img');
        imgElement.src = message.content;
        messageDiv.classList.add('image-message');
        messageDiv.appendChild(imgElement);
    } else if (message.type === 'audio') {
        const audioElement = document.createElement('audio');
        audioElement.controls = true;
        audioElement.src = message.content;
        messageDiv.classList.add('audio-container');
        messageDiv.appendChild(audioElement);
    } else {
        contentDiv.textContent = message.content;
    }

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
