import { getImageFromDallE } from './dallE.js';

const endpointURL = 'http://localhost:3001/chat';

let outputElement, submitButton, inputElement, historyElement, chatContainer;

window.onload = init;

function init() {
  outputElement = document.querySelector('#output');
  submitButton = document.querySelector('#submit');
  submitButton.onclick = getMessage;

  inputElement = document.querySelector('input');
  historyElement = document.querySelector('.history');
  chatContainer = document.querySelector('.chat-container');
}

function clearInput() {
  inputElement.value = '';
}

function newChat() {
  outputElement.innerHTML = '';
  historyElement.innerHTML = '';
  inputElement.value = '';
}

async function getMessage() {
  let prompt = inputElement.value.trim();
  if (!prompt) return;

  // Create and append user message
  const userMessage = document.createElement('p');
  userMessage.textContent = "User: " + prompt;
  userMessage.classList.add('user-message');
  chatContainer.append(userMessage);

  inputElement.value = '';

  if (prompt.startsWith('/image')) {
    const imagePrompt = prompt.slice(6).trim();
    const images = await getImageFromDallE(imagePrompt);
    images.data.forEach(imageObj => {
      const imageContainer = document.createElement('div');
      imageContainer.classList.add('image-container');
      const imgElement = document.createElement('img');
      imgElement.src = imageObj.url;
      imgElement.width = 256;
      imgElement.height = 256;
      imageContainer.append(imgElement);
      chatContainer.append(imageContainer); // Append image to chat container
    });
  } else {
    const response = await getResponseFromServer(prompt);
    if (response) {
      createChatItem('bot', response);
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
      chatContainer.append(audioContainer); // Append audio player to chat container
      return; // No text response to return
    }

    const data = await response.json();
    const botResponse = data.choices ? data.choices[0].message.content : '';
    return botResponse;
  } catch (error) {
    console.error('Error:', error);
    return 'Sorry, something went wrong. Please try again.';
  }
}

function createChatItem(sender, content) {
  const chatItem = document.createElement('div');
  chatItem.classList.add('chat-item', sender);

  const chatContent = document.createElement('div');
  chatContent.classList.add('content');
  chatContent.textContent = content;

  chatItem.appendChild(chatContent);
  chatContainer.appendChild(chatItem);

  chatContainer.scrollTop = chatContainer.scrollHeight;
}
