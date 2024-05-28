import { API_KEY } from './config.js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: API_KEY });

export async function generateImage(prompt, res) {
  try {
    const response = await openai.images.generate({
      model: "stable-diffusion",
      prompt: prompt,
      n: 1,
      size: "256x256",
    });

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating image');
  }
}
