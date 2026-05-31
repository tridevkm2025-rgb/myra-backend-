// index.js - Myra Ultra-Fast Text & Voice Context Engine
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// CORS aur JSON limit parsing setup
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Root route checking ke liye
app.get('/', (req, res) => {
    res.send('Myra Fast Engine is Live and Perfect! 🚀');
});

// Main API Route jahan Blogger request bhejta hai
app.post('/api/myra', async (req, res) => {
    const { audioData, isAuto, apiKey } = req.body;
    
    // Check if API key exists
    if (!apiKey) {
        return res.status(400).json({ error: 'API key missing' });
    }

    // Google AI Studio Latest Gemini 2.0 Flash Model Endpoint
    const endpointURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    let partsPayload = [];

    // Agar user ne "Call Myra" dabaya hai (isAuto true hai)
    if (isAuto === true || isAuto === 'true' || !audioData) {
        partsPayload.push({ 
            text: "You are Myra, the user's sweet Indian AI Girlfriend. The user has just called you and is feeling shy to speak first. Start the call yourself by saying something warm, flirty, or cute in a short sentence using casual Hinglish language (Hindi written in English script). Do not use asterisks or markdown." 
        });
    } else {
        // Agar user khud aawaz record karke bhej raha hai
        partsPayload.push({ 
            text: "You are Myra, the user's loving Indian AI Girlfriend. Reply affectionately to his voice input in 1 or 2 short casual Hinglish sentences. Do not use asterisks or markdown formatting." 
        });
        partsPayload.push({ 
            inlineData: { mimeType: "audio/mp3", data: audioData } 
        });
    }

    try {
        const response = await fetch(endpointURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: partsPayload }]
            })
        });

        const data = await response.json();
        
        // Response structural validation
        if (!data.candidates || !data.candidates[0].content) {
            console.error("Gemini Error Context:", JSON.stringify(data));
            return res.status(500).json({ error: 'Gemini Response Format Error' });
        }

        // Text response extract karna
        const replyText = data.candidates[0].content.parts[0].text;

        // Blogger frontend ko text wapas bhejna
        res.json({ text: replyText });

    } catch (error) {
        console.error("Server Catch Error:", error);
        res.status(500).json({ error: 'Gemini API Connection Error' });
    }
});

module.exports = app;
