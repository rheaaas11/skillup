import { useState, useEffect } from "react";
import Landing from "./components/Landing";
import Upload from "./components/Upload";
import Processing from "./components/Processing";
import Results from "./components/Results";
import Navbar, { type MainTab } from "./components/Navbar";
import History, { type HistoryItem } from "./components/History";
import Library from "./components/Library";
import Roadmap from "./components/Roadmap";
import { analyzeSkill, type AnalysisResult } from "./lib/gemini";

type ViewState = "landing" | "upload" | "processing" | "results" | "history" | "library" | "roadmap";

export default function App() {
  const [view, setView] = useState<ViewState>("landing");
  const [activeTab, setActiveTab] = useState<MainTab>("home");
  const [skill, setSkill] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [skillPaths, setSkillPaths] = useState<any[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmoji, setUserEmoji] = useState<string>("👋");

  useEffect(() => {
    const savedName = localStorage.getItem("ai_skills_name");
    if (savedName) setUserName(savedName);
    const savedEmoji = localStorage.getItem("ai_skills_emoji");
    if (savedEmoji) setUserEmoji(savedEmoji);
    
    const savedHistory = localStorage.getItem("ai_skills_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
    const savedRoadmap = localStorage.getItem("ai_skills_roadmap");
    if (savedRoadmap) {
      try {
        setCompletedLessons(JSON.parse(savedRoadmap));
      } catch (e) {
        console.error("Failed to parse roadmap progress", e);
      }
    }
    const savedPaths = localStorage.getItem("ai_skills_paths");
    if (savedPaths) {
      try {
        const parsed = JSON.parse(savedPaths);
        // If it has 'icon' property or old lesson structure, it's the old format
        if (parsed.length > 0 && (parsed[0].icon || !parsed[0].lessons[0].beginner)) {
          localStorage.removeItem("ai_skills_paths");
        } else {
          setSkillPaths(parsed);
        }
      } catch (e) {
        console.error("Failed to parse paths", e);
      }
    }
  }, []);

  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem("ai_skills_history", JSON.stringify(newHistory));
  };

  const saveRoadmap = (newCompleted: string[]) => {
    setCompletedLessons(newCompleted);
    localStorage.setItem("ai_skills_roadmap", JSON.stringify(newCompleted));
  };

  const savePaths = (newPaths: any[]) => {
    setSkillPaths(newPaths);
    localStorage.setItem("ai_skills_paths", JSON.stringify(newPaths));
  };

  const saveUser = (name: string, emoji: string) => {
    setUserName(name);
    setUserEmoji(emoji);
    localStorage.setItem("ai_skills_name", name);
    localStorage.setItem("ai_skills_emoji", emoji);
  };

  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
    if (tab === "home") setView("landing");
    if (tab === "history") setView("history");
    if (tab === "library") setView("library");
    if (tab === "roadmap") setView("roadmap");
  };

  const handleStart = () => setView("upload");
  const handleBack = () => setView("landing");

  const handleAnalyze = async (file: File, selectedSkill: string) => {
    setSkill(selectedSkill);
    setView("processing");

    // Auto-add skill if it doesn't exist
    if (!skillPaths.find(p => p.title === selectedSkill)) {
      const newPath = {
        id: Date.now().toString(),
        title: selectedSkill,
        description: `Your journey to master ${selectedSkill}.`,
        iconName: "Sparkles",
        lessons: []
      };
      savePaths([...skillPaths, newPath]);
    }

    // Gemini inlineData has a 20MB limit
    const MAX_SIZE = 20 * 1024 * 1024; 
    if (file.size > MAX_SIZE) {
      alert("Video too large: Please use a video under 20MB for analysis.");
      setView("upload");
      return;
    }

    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(",")[1];
        
        try {
          const analysis = await analyzeSkill(base64Data, file.type, selectedSkill);
          setResult(analysis);
          
          const newItem: HistoryItem = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            skill: selectedSkill,
            result: analysis,
          };
          saveHistory([newItem, ...history]);
          
          setView("results");
        } catch (error: any) {
          console.error("Analysis failed:", error);
          let message = "Failed to analyze video.";
          
          if (error?.message?.includes("API_KEY_INVALID") || error?.message?.includes("API key not valid")) {
            message = "API Key Error: Please check your GitHub Secrets.";
          } else if (error?.message?.includes("leaked") || error?.message?.includes("403")) {
            message = "CRITICAL: Your API key has been disabled by Google because it was 'leaked' (visible in public code). You must generate a NEW key in Google AI Studio and update your GitHub Secrets.";
          } else if (error?.message?.includes("429") || error?.message?.includes("Quota")) {
            message = "Too many people are using the app right now. Please wait a minute and try again.";
          } else if (error?.message?.includes("location") || error?.message?.includes("region")) {
            message = "Gemini AI is not available in your current country/region.";
          } else {
            // Show the actual error message so we can diagnose it
            message = `Error: ${error?.message || "Unknown error occurred"}. Try a shorter video.`;
          }
          
          alert(message);
          setView("upload");
        }
      };

      reader.onerror = () => {
        console.error("Failed to read file");
        alert("Failed to read video file.");
        setView("upload");
      };
    } catch (error) {
      console.error(error);
      setView("upload");
    }
  };

  const handleReset = () => {
    setResult(null);
    setSkill("");
    setVideoUrl(null);
    if (activeTab === "history") {
      setView("history");
    } else {
      setView("upload");
    }
  };

  const handleViewHistoryResult = (item: HistoryItem) => {
    setSkill(item.skill);
    setResult(item.result);
    setVideoUrl(null);
    setView("results");
  };

  return (
    <div className="font-sans text-text bg-bg min-h-screen selection:bg-nav selection:text-white">
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} userName={userName} userEmoji={userEmoji} />
      
      {view === "landing" && (
        <Landing 
          onStart={handleStart} 
          history={history} 
          completedLessons={completedLessons} 
          userName={userName} 
          userEmoji={userEmoji}
          onSaveUser={saveUser}
        />
      )}
      {view === "upload" && <Upload onAnalyze={handleAnalyze} onBack={handleBack} />}
      {view === "processing" && <Processing skill={skill} />}
      {view === "results" && result && (
        <Results result={result} skill={skill} videoUrl={videoUrl} onReset={handleReset} />
      )}
      {view === "history" && (
        <History 
          history={history} 
          onViewResult={handleViewHistoryResult} 
          onClearHistory={() => saveHistory([])} 
        />
      )}
      {view === "library" && <Library />}
      {view === "roadmap" && <Roadmap completedLessons={completedLessons} setCompletedLessons={saveRoadmap} skillPaths={skillPaths} setSkillPaths={savePaths} />}
    </div>
  );
}

