// index.js - Myra Ultra-Fast Text Engine
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Myra Fast Engine is Live! 🚀');
});

app.post('/api/myra', async (req, res) => {
    const { audioData, isAuto, apiKey } = req.body;
    
    if (!apiKey) {
        return res.status(400).json({ error: 'API key missing' });
    }

    const endpointURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    let promptText = "You are Myra, the user's loving Indian AI Girlfriend. Reply affectionately to his chat in 1 or 2 short casual Hinglish sentences. Do not use asterisks or markdown formatting.";
    if (isAuto) {
        promptText = "You are Myra, the user's sweet Indian AI Girlfriend. Start the call yourself by saying something warm, flirty, or cute in a short sentence using casual Hinglish language.";
    }

    try {
        const response = await fetch(endpointURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();
        const replyText = data.candidates[0].content.parts[0].text;

        res.json({ text: replyText });

    } catch (error) {
        res.status(500).json({ error: 'Gemini API Error' });
    }
});

module.exports = app;
