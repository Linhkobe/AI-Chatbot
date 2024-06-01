import { getImageFromDallE } from './dallE.js';

const endpointURL = 'http://localhost:3001/chat';

let outputElement, submitButton, inputElement, historyElement, chatContainer;
let chatCounter = 0;
let currentChatId = null;
let chatSessions = [];

window.onload = init;
window.newChat = function() {
    chatCounter++;
    currentChatId = 'chat' + chatCounter;

    chatSessions.push({ id: currentChatId, messages: [] });

    const chatButton = document.createElement('button');
    chatButton.className = 'chat-button'; 
    chatButton.id = currentChatId + '-button';
    chatButton.onclick = () => showChat(currentChatId);
    chatButton.innerText = 'Chat ' + chatCounter;
    document.getElementById('chat-buttons-container').appendChild(chatButton);
    chatContainer.innerHTML = '';
}
window.showChat = function showChat(chatId) {
    
    const chatSession = chatSessions.find(session => session.id === chatId);

    if (chatSession) {
        
        chatContainer.innerHTML = '';

        chatSession.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', message.sender);

            if (message.type === 'image') {
                const imgElement = document.createElement('img');
                imgElement.src = message.content;
                imgElement.width = 256;
                imgElement.height = 256;
                messageDiv.appendChild(imgElement);
            } else if (message.type === 'audio') {
                messageDiv.innerHTML = message.content;
            } else {
                if (message.sender === 'user') {
                    messageDiv.textContent = "User: " + message.content;
                } else {
                    messageDiv.textContent = message.content;
                }
            }

            chatContainer.appendChild(messageDiv);
        });

        currentChatId = chatId;
    }
}

function init() {
    outputElement = document.querySelector('#output');
    submitButton = document.querySelector('#submit');
    submitButton.onclick = getMessage;

    inputElement = document.querySelector('input');
    historyElement = document.querySelector('.history');
    chatContainer = document.querySelector('.chat-container');

    newChat();
}

async function getMessage() {
    let prompt = inputElement.value.trim();
    if (!prompt) return;

    const chatSession = chatSessions.find(session => session.id === currentChatId);

    if (chatSession) {
        const userMessage = { sender: 'user', content: prompt };
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
        } else {
            const response = await getResponseFromServer(prompt);
            if (response) {
                const botMessage = { sender: 'bot', content: response };
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
            const audioElement = document.createElement('audio');
            audioElement.controls = true;
            audioElement.src = audioUrl;
            const audioContainer = document.createElement('div');
            audioContainer.classList.add('audio-container');
            audioContainer.appendChild(audioElement);
            appendMessage({ sender: 'bot', content: audioContainer.outerHTML, type: 'audio' });
            return;
        }

        const data = await response.json();
        const botResponse = data.choices ? data.choices[0].message.content : '';

        if (botResponse) {
        createChatItem('bot', botResponse, 'chatbot');
        }
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

  if (message.sender === 'user') {
      messageDiv.classList.add('user-message');
  } else if (message.sender === 'chatbot' && message.type === 'text') {
    messageDiv.classList.add('chatbot');
  }

  if (message.type === 'image') {
      const imgElement = document.createElement('img');
      imgElement.src = message.content;
      imgElement.width = 256;
      imgElement.height = 256;
      messageDiv.appendChild(imgElement);
  } else if (message.type === 'audio') {
      messageDiv.innerHTML = message.content;
  } else {
      if (message.sender === 'user') {
          messageDiv.textContent = "User: " + message.content;
      } else {
          messageDiv.textContent = message.content;
      }
  }

  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function createChatItem(sender, content, className) {
    const chatItem = document.createElement('div');
    chatItem.classList.add('chat-item', sender);
  
    if (className) {
      chatItem.classList.add(className);
    }
  
    const chatContent = document.createElement('div');
    chatContent.classList.add('content');
    chatContent.textContent = content;
  
    chatItem.appendChild(chatContent);
    chatContainer.appendChild(chatItem);
  
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
