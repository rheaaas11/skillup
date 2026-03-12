export interface AnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvement_plan: string[];
  recommended_resources: { title: string; search_query: string }[];
  timeline: { time: string; type: "mistake" | "warning" | "good"; description: string }[];
  drills: { title: string; description: string; link: string }[];
  expert_feedback: string;
  skill_library: { title: string; content: string }[];
}

export async function askLibrary(question: string): Promise<string> {
  const response = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to get response");
  }

  const data = await response.json();
  return data.text;
}

export async function generateRoadmap(skill: string): Promise<any[]> {
  const response = await fetch("/api/roadmap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skill }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate roadmap");
  }

  const data = await response.json();
  return data.data;
}

export async function analyzeSkill(videoBase64: string, mimeType: string, skill: string): Promise<AnalysisResult> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoBase64, mimeType, skill }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to analyze video");
  }

  const data = await response.json();
  return data.data;
}
