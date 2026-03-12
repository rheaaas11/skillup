import React, { useState } from "react";
import { motion } from "motion/react";
import { Check, Lock, Star, Flame, Trophy, BookOpen, Music, Zap, BrainCircuit, Sparkles, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import LessonPage from "./LessonPage";
import { generateRoadmap } from "../lib/gemini";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface LevelContent {
  theory: string;
  practiceTask: string;
  uploadRequirements: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  beginner: LevelContent;
  intermediate: LevelContent;
  advanced: LevelContent;
  quiz: QuizQuestion[];
}

export interface SkillPath {
  id: string;
  title: string;
  description: string;
  iconName: string;
  lessons: Lesson[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-8 h-8" />,
  Music: <Music className="w-8 h-8" />,
  BrainCircuit: <BrainCircuit className="w-8 h-8" />,
  Flame: <Flame className="w-8 h-8" />,
  Trophy: <Trophy className="w-8 h-8" />,
  BookOpen: <BookOpen className="w-8 h-8" />,
  Zap: <Zap className="w-8 h-8" />,
};

export default function Roadmap({ completedLessons, setCompletedLessons, skillPaths, setSkillPaths }: { completedLessons: string[], setCompletedLessons: (lessons: string[]) => void, skillPaths: SkillPath[], setSkillPaths: (paths: SkillPath[]) => void }) {
  const [selectedPath, setSelectedPath] = useState<SkillPath | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [newSkill, setNewSkill] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const addSkill = async () => {
    if (newSkill.trim()) {
      setIsGenerating(true);
      try {
        const lessons = await generateRoadmap(newSkill);
        const newPath: SkillPath = {
          id: Date.now().toString(),
          title: newSkill,
          description: `Your journey to master ${newSkill}.`,
          iconName: "Sparkles",
          lessons: lessons
        };
        setSkillPaths([...skillPaths, newPath]);
        setNewSkill("");
      } catch (error) {
        console.error("Failed to generate roadmap", error);
        alert("Failed to generate roadmap. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const completeLesson = (id: string) => {
    if (!completedLessons.includes(id)) {
      const newCompleted = [...completedLessons, id];
      setCompletedLessons(newCompleted);
    }
    setActiveLesson(null);
  };

  if (activeLesson) {
    return (
      <LessonPage 
        lesson={activeLesson} 
        onComplete={() => completeLesson(activeLesson.id)} 
        onBack={() => setActiveLesson(null)} 
      />
    );
  }

  if (selectedPath) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-bg p-6 lg:p-12 flex flex-col items-center">
        <button onClick={() => setSelectedPath(null)} className="mb-8 text-nav font-medium">← Back to Dashboard</button>
        <h1 className="text-4xl font-serif text-text mb-12">{selectedPath.title}</h1>
        <div className="relative flex flex-col items-center py-8">
          {selectedPath.lessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isUnlocked = index === 0 || completedLessons.includes(selectedPath.lessons[index - 1].id);
            
            return (
              <motion.div key={lesson.id} className="relative flex flex-col items-center mb-16">
                <button
                  onClick={() => isUnlocked && setActiveLesson(lesson)}
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-sm border-4",
                    isCompleted ? "bg-nav border-nav text-white" : isUnlocked ? "bg-white border-nav text-nav" : "bg-bg border-text/10 text-text/40"
                  )}
                >
                  {isCompleted ? <Check className="w-8 h-8" /> : <Star className="w-8 h-8" />}
                </button>
                <div className="mt-4 text-center font-serif text-lg">{lesson.title}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-bg p-6 lg:p-12">
      <h1 className="text-4xl font-serif text-text mb-12 text-center">Learning Dashboard</h1>
      
      <div className="max-w-md mx-auto mb-12 flex gap-4">
        <input 
          type="text" 
          value={newSkill} 
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add a new skill to learn..."
          className="flex-1 p-4 rounded-full border border-text/10 bg-white"
        />
        <button 
          onClick={addSkill} 
          disabled={isGenerating}
          className="px-8 py-4 bg-nav text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            "Add"
          )}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {skillPaths.map(path => (
          <motion.button
            key={path.id}
            onClick={() => setSelectedPath(path)}
            className="bg-white p-8 rounded-[32px] shadow-soft text-left hover:scale-105 transition-transform"
          >
            <div className="w-16 h-16 bg-bg text-nav rounded-full flex items-center justify-center mb-6">{ICON_MAP[path.iconName] || <Sparkles className="w-8 h-8" />}</div>
            <h2 className="text-2xl font-serif text-text mb-2">{path.title}</h2>
            <p className="text-text/70">{path.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
