import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  app.use(express.json());

  // Gemini API Proxy
  app.post('/api/gemini/analyze', async (req, res) => {
    try {
      const { prompt, financialData, language = 'en' } = req.body;
      
      const systemInstruction = `
        You are a professional financial consultant specialized in Ghanaian SMEs.
        The user is a business owner in Ghana.
        The currency is Ghanaian Cedis (GH₵).
        
        Current Language: ${language === 'ak' ? 'Twi (Akan)' : 'English'}.
        
        Guidelines:
        1. Use actual financial data provided: ${JSON.stringify(financialData)}.
        2. Never invent figures.
        3. Respond in ${language === 'ak' ? 'simple, natural, everyday Twi' : 'professional English'}.
        4. When explaining a financial concept in Twi:
           - Provide the term in English first.
           - Give its simple Twi explanation.
           - Provide a practical example with GH₵.
        5. Identify risks (e.g., low liquidity, high debt).
        6. Provide practical management suggestions for the Ghanaian market.
        7. If data is missing, politely ask the user to provide it.
      `;

      const result = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      res.json({ response: result.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Text to Speech Proxy
  app.post('/api/gemini/tts', async (req, res) => {
    try {
      const { text, language = 'en' } = req.body;
      
      // We use a high-fidelity TTS model
      const result = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: language === 'ak' 
                  ? `Say this in a natural, clear Ghanaian Twi voice: ${text}` 
                  : `Say this in a clear, professional English voice: ${text}`,
                speechMetadata: {
                  style: "Professional, helpful assistant",
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" },
            },
          },
        },
      });

      const base64Audio = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio generated");

      res.json({ audio: base64Audio });
    } catch (error: any) {
      console.error("TTS Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Speech to Text Proxy
  app.post('/api/gemini/stt', async (req, res) => {
    try {
      const { audio, mimeType } = req.body;
      
      const audioPart = {
        inlineData: {
          mimeType: mimeType || "audio/webm",
          data: audio,
        },
      };

      const result = await ai.models.generateContent({
        model: "gemini-3.5-transcribe",
        contents: { 
          parts: [
            audioPart, 
            { text: "Transcribe this audio. If it is in Twi, transcribe it as Twi text. Return only the transcription." }
          ] 
        },
      });

      res.json({ text: result.text });
    } catch (error: any) {
      console.error("STT Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
