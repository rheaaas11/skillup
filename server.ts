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
      const prompt = `You are an expert AI Skills Coach. Create a comprehensive and highly detailed 5-lesson roadmap for a user who wants to learn: "${skill}".

For EACH lesson and EACH level (beginner, intermediate, advanced):
1. The "theory" section MUST be a thorough explanation (at least 200-300 words) covering the "why" and "how" of the specific topic.
2. The "practiceTask" MUST be a clear, actionable exercise that the user can perform on camera.
3. The "uploadRequirements" MUST specify exactly what the user needs to show in their video for the AI to analyze it effectively.

Provide ONLY a valid JSON array. No markdown, no extra text.`;
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING" },
                title: { type: "STRING" },
                description: { type: "STRING" },
                beginner: {
                  type: "OBJECT",
                  properties: {
                    theory: { type: "STRING", description: "Detailed educational content (2-3 paragraphs)" },
                    practiceTask: { type: "STRING", description: "Step-by-step exercise instructions" },
                    uploadRequirements: { type: "STRING", description: "Specific visual cues for video analysis" }
                  },
                  required: ["theory", "practiceTask", "uploadRequirements"]
                },
                intermediate: {
                  type: "OBJECT",
                  properties: {
                    theory: { type: "STRING", description: "Detailed educational content (2-3 paragraphs)" },
                    practiceTask: { type: "STRING", description: "Step-by-step exercise instructions" },
                    uploadRequirements: { type: "STRING", description: "Specific visual cues for video analysis" }
                  },
                  required: ["theory", "practiceTask", "uploadRequirements"]
                },
                advanced: {
                  type: "OBJECT",
                  properties: {
                    theory: { type: "STRING", description: "Detailed educational content (2-3 paragraphs)" },
                    practiceTask: { type: "STRING", description: "Step-by-step exercise instructions" },
                    uploadRequirements: { type: "STRING", description: "Specific visual cues for video analysis" }
                  },
                  required: ["theory", "practiceTask", "uploadRequirements"]
                },
                quiz: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      question: { type: "STRING" },
                      options: { type: "ARRAY", items: { type: "STRING" } },
                      correctAnswer: { type: "INTEGER" }
                    },
                    required: ["question", "options", "correctAnswer"]
                  }
                }
              },
              required: ["id", "title", "description", "beginner", "intermediate", "advanced", "quiz"]
            }
          }
        }
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
