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
  userMessage.textContent = prompt;
  userMessage.classList.add('user-message');
  chatContainer.append(userMessage);

  inputElement.value = '';

/*   const userMessage = document.createElement('p');
  userMessage.textContent = prompt;
  userMessage.onclick = () => {
    inputElement.value = userMessage.textContent;
  };
  historyElement.append(userMessage); */

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
      outputElement.append(imageContainer);
    });
  } else {
/*     const response = await getResponseFromServer(prompt);
    if (response) {
      createChatItem('bot', response);
    } */
    // Get and append bot response
    const response = await getResponseFromServer(prompt);
    if (response) {
      const botMessage = document.createElement('p');
      botMessage.textContent = response;
      botMessage.classList.add('bot-message');
      chatContainer.append(botMessage);
    }
  }

  inputElement.value = '';
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
      outputElement.innerHTML = ''; // Clear the output element
      outputElement.appendChild(audioElement); // Append the audio player to the output element
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
