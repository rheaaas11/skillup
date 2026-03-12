import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  // Increase payload limit for Render (e.g., 50mb)
  app.use(express.json({ limit: '50mb' }));
  app.use(cors());

  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenAI({ apiKey: apiKey || "" });

  // API Route for Analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      if (!apiKey) {
        console.error("API Key missing");
        return res.status(500).json({ error: "Server API Key not configured. Please set GEMINI_API_KEY in environment variables." });
      }
      const { videoBase64, mimeType, skill } = req.body;
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
      const prompt = `You are an expert AI Skills Coach. The user is asking for advice or knowledge about a skill.
Question: "${question}"
Provide a detailed, structured, and helpful response. Use markdown formatting for readability.`;
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
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
      const prompt = `You are an expert AI Skills Coach. Create a detailed 5-lesson roadmap for a user who wants to learn: "${skill}".
Each lesson must be very detailed, teaching the skill thoroughly.
For each lesson, include:
- id (string)
- title (string)
- description (string)
- beginner: { theory: string, practiceTask: string, uploadRequirements: string }
- intermediate: { theory: string, practiceTask: string, uploadRequirements: string }
- advanced: { theory: string, practiceTask: string, uploadRequirements: string }
- quiz: { question: string, options: string[], correctAnswer: number }[]
Provide ONLY a valid JSON array. No markdown, no extra text.`;
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });
      
      const text = result.text || "[]";
      const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
      res.json({ data: JSON.parse(cleanJson) });
    } catch (error: any) {
      console.error("Roadmap Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
