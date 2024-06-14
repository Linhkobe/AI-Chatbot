import express from 'express';
import { API_KEY, HUGGING_FACE_API_KEY } from './config.js';
import OpenAI from "openai";
import multer from 'multer';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// create an instance of OpenAI with the api key
const openai = new OpenAI({
  apiKey: API_KEY,
});

const app = express();
const port = 3001;

// configure CORS support
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// init multer to handle form data
const upload = multer();

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// handle post request to /chat
app.post('/chat', upload.none(), async (req, res) => {
  const prompt = req.body.prompt;
  console.log("PROMPT: ", prompt);

  if (prompt.startsWith('/speech')) {
    const speechPrompt = prompt.slice(7).trim();
    try {
      const chatResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: [{ role: "user", content: speechPrompt }],
        temperature: 1,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      const botResponse = chatResponse.choices ? chatResponse.choices[0].message.content : '';
      createSpeech(botResponse, res);
    } catch (error) {
      console.error('Error generating chat response:', error);
      res.status(500).json({ error: 'Error generating chat response' });
    }
  } else if (prompt.startsWith('/stable')) {
    const stablePrompt = prompt.slice(8).trim();
    generateStableDiffusionImage(stablePrompt, res);
  } else {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        messages: [{ role: "user", content: prompt }],
        temperature: 1,
        max_tokens: 50,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      res.json(response);
    } catch (error) {
      console.error('Error generating chat response:', error);
      res.status(500).json({ error: 'Error generating chat response' });
    }
  }
});

// handle post request to /image
app.post('/image', upload.none(), async (req, res) => {
  const prompt = req.body.prompt;
  console.log("IMAGE PROMPT: ", prompt);

  try {
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: prompt,
      n: 1,
      size: "256x256",
    });

    res.json(response);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Error generating image' });
  }
});

// handle post request to /stable
app.post('/stable', upload.none(), async (req, res) => {
  const prompt = req.body.prompt;
  console.log("STABLE DIFFUSION PROMPT: ", prompt);

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: prompt })
    });

    console.log("Stable Diffusion API response status:", response.status);

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error('Error from Stable Diffusion API:', errorMessage);
      throw new Error(`Server error: ${response.status}`);
    }

    const imageBuffer = await response.buffer();
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    console.log("Image URL:", imageUrl);

    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Error generating stable diffusion image:', error);
    res.status(500).json({ error: 'Error generating stable diffusion image' });
  }
});

async function createSpeech(text, res) {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    res.set('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (error) {
    console.error('Error creating speech:', error);
    res.status(500).json({ error: 'Error creating speech' });
  }
}

// start server and listen to port 3001
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
