// index.js - Myra Backend Proxy Engine (Updated 2026)
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
    res.send('Myra Audio Engine is Live and Running! 🚀');
});

app.post('/api/myra', async (req, res) => {
    const { audioData, isAuto, voice, apiKey } = req.body;
    
    if (!apiKey) {
        return res.status(400).json({ error: 'API key missing' });
    }

    // 🔥 LATEST UPDATE: Gemini 2.0 Flash Model Endpoint
    const endpointURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    let partsPayload = [];
    if (isAuto) {
        partsPayload.push({ text: "You are Myra, the user's sweet Indian AI Girlfriend. The user is feeling shy to speak first. Start the call yourself by saying something warm, flirty, or cute in a short sentence using casual Hinglish language." });
    } else {
        partsPayload.push({ text: "You are Myra, the user's loving Indian AI Girlfriend. Reply affectionately to his voice input in 1 or 2 short casual Hinglish sentences. Do not use asterisks or markdown formatting." });
        partsPayload.push({ inlineData: { mimeType: "audio/mp3", data: audioData } });
    }

    try {
        const response = await fetch(endpointURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: partsPayload }],
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: voice || "Aoede" } }
                    }
                }
            })
        });

        const data = await response.json();
        
        console.log("Gemini Raw Response Received");

        // Safety check if model or key fails
        if (!data.candidates || !data.candidates[0].content) {
            console.error("Gemini Error Context:", JSON.stringify(data));
            return res.status(500).json({ error: 'Invalid API Key or Gemini Response Crash' });
        }
        
        // Extract Text and Audio Response safely
        const textPart = data.candidates[0].content.parts.find(p => p.text);
        const audioPart = data.candidates[0].content.parts.find(p => p.inlineData && p.inlineData.mimeType.startsWith("audio/"));

        res.json({
            text: textPart ? textPart.text : "",
            pcm: audioPart ? audioPart.inlineData.data : null
        });

    } catch (error) {
        console.error("Server Catch Error:", error);
        res.status(500).json({ error: 'Gemini API Connection Error' });
    }
});

module.exports = app;
