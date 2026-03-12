import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

// Vercel Serverless functions have a 4.5MB limit. 
// We set this to 5mb to catch the error gracefully.
app.use(express.json({ limit: '5mb' }));
app.use(cors());

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: apiKey || "" });

app.post("/api/analyze", async (req, res) => {
  try {
    if (!apiKey) {
      console.error("API Key missing");
      return res.status(500).json({ error: "Server API Key not configured. Please set GEMINI_API_KEY in environment variables." });
    }
    
    const { videoBase64, mimeType, skill } = req.body;
    
    // Check size again on server
    const sizeInBytes = Buffer.from(videoBase64, 'base64').length;
    if (sizeInBytes > 4.5 * 1024 * 1024) {
      return res.status(413).json({ error: "Video is too large for Vercel's free tier (4.5MB limit). Please use a shorter clip." });
    }

    const prompt = `You are an expert AI Skills Coach. Analyze the following video of a user performing the skill: "${skill}".
Pay attention to body posture, movement, voice tone, confidence, and technique specific to this skill.
Provide structured, constructive, and highly actionable feedback. Include a timeline of mistakes/good moments, a 3-drill implementation plan, an expert 2-4 sentence feedback, and an AI skill library with technique guides and common mistakes.
Provide ONLY a valid JSON object. No markdown, no extra text.`;

    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [
          { inlineData: { data: videoBase64, mimeType: mimeType } },
          { text: prompt }
        ]
      }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = result.text || "{}";
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    res.json({ data: JSON.parse(cleanJson) });
  } catch (error: any) {
    console.error("Analysis Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during analysis" });
  }
});

app.post("/api/ask", async (req, res) => {
  try {
    if (!apiKey) return res.status(500).json({ error: "Server API Key not configured" });
    const { question } = req.body;
    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question
    });
    res.json({ text: result.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/roadmap", async (req, res) => {
  try {
    if (!apiKey) return res.status(500).json({ error: "Server API Key not configured" });
    const { skill } = req.body;
    const prompt = `Create a 5-lesson roadmap for: "${skill}". Provide ONLY a valid JSON array. No markdown, no extra text.`;
    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });
    const text = result.text || "[]";
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    res.json({ data: JSON.parse(cleanJson) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
