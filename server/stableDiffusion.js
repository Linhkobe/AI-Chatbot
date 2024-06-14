require('dotenv').config();

const apiKey = process.env.HUGGING_FACE_API_KEY;

export async function getStableDiffusionImage(prompt) {
    const response = await fetch('https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data; // Ensure that this is an array of image URLs
}
