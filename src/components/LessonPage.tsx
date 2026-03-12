import React, { useState } from "react";
import { ArrowLeft, BookOpen, Dumbbell, Upload as UploadIcon, CheckCircle2 } from "lucide-react";
import Upload from "./Upload";
import Processing from "./Processing";
import Results from "./Results";
import Quiz from "./Quiz";
import { analyzeSkill, type AnalysisResult } from "../lib/gemini";
import type { Lesson } from "./Roadmap";

interface LessonPageProps {
  lesson: Lesson;
  onComplete: () => void;
  onBack: () => void;
}

export default function LessonPage({ lesson, onComplete, onBack }: LessonPageProps) {
  const [view, setView] = useState<"level" | "content" | "upload" | "processing" | "results" | "quiz">("level");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced" | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleAnalyze = async (file: File) => {
    if (!level) return;
    setView("processing");
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(",")[1];
        
        try {
          const analysis = await analyzeSkill(base64Data, file.type, lesson[level].practiceTask);
          setResult(analysis);
          setView("results");
        } catch (error) {
          console.error("Analysis failed:", error);
          alert("Failed to analyze video.");
          setView("upload");
        }
      };
    } catch (error) {
      console.error(error);
      setView("upload");
    }
  };

  if (view === "level") {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-bg p-6 lg:p-12 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-serif text-text mb-12">What is your current level?</h1>
        <div className="grid gap-6 w-full max-w-md">
          {(["beginner", "intermediate", "advanced"] as const).map((l) => (
            <button
              key={l}
              onClick={() => { setLevel(l); setView("content"); }}
              className="p-6 bg-white rounded-2xl shadow-soft hover:scale-105 transition-transform text-left capitalize text-xl font-medium"
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === "processing") {
    return <Processing skill={lesson.title} />;
  }

  if (view === "results" && result) {
    return (
      <div className="pb-24">
        <Results result={result} skill={lesson.title} videoUrl={videoUrl} onReset={() => setView("upload")} />
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-text/10 flex justify-center z-50">
          <button
            onClick={() => setView("quiz")}
            className="px-10 py-4 bg-nav hover:bg-nav/90 text-white rounded-full font-medium text-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" /> Take Quiz & Complete
          </button>
        </div>
      </div>
    );
  }

  if (view === "quiz") {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-bg p-6 lg:p-12">
        <div className="max-w-3xl mx-auto">
          <Quiz questions={lesson.quiz} onComplete={onComplete} />
        </div>
      </div>
    );
  }

  if (!level) return null;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-bg p-6 lg:p-12">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="text-nav hover:text-text flex items-center gap-2 mb-10 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Roadmap
        </button>

        <h1 className="text-4xl lg:text-5xl font-serif text-text mb-12">{lesson.title} <span className="text-text/50 capitalize">({level})</span></h1>

        <div className="space-y-10">
          <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-text/10">
            <h2 className="flex items-center gap-4 text-2xl font-serif text-text mb-6">
              <div className="w-12 h-12 bg-bg rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-nav" />
              </div>
              1. Theory
            </h2>
            <p className="text-text/70 leading-relaxed text-lg">{lesson[level].theory}</p>
          </div>

          <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-text/10">
            <h2 className="flex items-center gap-4 text-2xl font-serif text-text mb-6">
              <div className="w-12 h-12 bg-bg rounded-full flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-nav" />
              </div>
              2. Practice Task
            </h2>
            <p className="text-text/70 leading-relaxed text-lg mb-4">{lesson[level].practiceTask}</p>
            <p className="text-text/90 font-medium mb-10">Requirement: {lesson[level].uploadRequirements}</p>
            
            {view === "content" ? (
              <button
                onClick={() => setView("upload")}
                className="w-full py-5 bg-nav hover:bg-nav/90 text-white rounded-full font-medium flex items-center justify-center gap-3 transition-colors shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-lg"
              >
                <UploadIcon className="w-5 h-5" /> I'm Ready to Upload
              </button>
            ) : (
              <div className="mt-8 border-t border-text/10 pt-8">
                <Upload 
                  onAnalyze={(file) => handleAnalyze(file)} 
                  onBack={() => setView("content")} 
                  fixedSkill={lesson.title}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
