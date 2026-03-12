import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Activity, Flame, Target, UploadCloud, ChevronDown } from "lucide-react";
import { type HistoryItem } from "./History";
import { cn } from "../lib/utils";

interface LandingProps {
  onStart: () => void;
  history: HistoryItem[];
  completedLessons: string[];
  userName: string;
  userEmoji: string;
  onSaveUser: (name: string, emoji: string) => void;
}

export default function Landing({ onStart, history, completedLessons, userName, userEmoji, onSaveUser }: LandingProps) {
  const [name, setName] = React.useState(userName);
  const [emoji, setEmoji] = React.useState(userEmoji || "👋");
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const emojis = ["👋", "🚀", "🎯", "💡", "🎨", "🔥"];

  // Calculate stats
  const avgScore = history.length > 0 
    ? Math.round(history.reduce((acc, item) => acc + item.result.score, 0) / history.length) 
    : 0;

  const calculateStreak = (historyItems: HistoryItem[]) => {
    if (historyItems.length === 0) return 0;
    
    const sortedDates = [...new Set(historyItems.map(item => new Date(item.date).toDateString()))]
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const date of sortedDates) {
      if (date.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (date.getTime() === currentDate.getTime() + 86400000) {
        // Already counted
        continue;
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = calculateStreak(history);
  const weeklyProgress = Math.min(history.filter(item => {
    const itemDate = new Date(item.date);
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return itemDate >= oneWeekAgo;
  }).length, weeklyGoal);

  if (!userName) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-bg">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[32px] shadow-soft max-w-md w-full"
        >
          <h2 className="text-3xl font-serif text-text mb-6">Welcome to SkillUp!</h2>
          <input 
            type="text" 
            placeholder="Enter your name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 rounded-xl border border-text/10 mb-6"
          />
          <div className="flex gap-2 mb-8">
            {emojis.map(e => (
              <button 
                key={e} 
                onClick={() => setEmoji(e)}
                className={cn("text-2xl p-3 rounded-xl border", emoji === e ? "bg-accent/10 border-accent" : "border-text/10")}
              >
                {e}
              </button>
            ))}
          </div>
          <button 
            onClick={() => onSaveUser(name, emoji)}
            disabled={!name}
            className="w-full py-4 bg-nav text-white rounded-full font-medium disabled:opacity-50"
          >
            Get Started
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-bg overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-serif text-text mb-4 tracking-tight leading-none">
            Welcome back,<br/><span className="italic text-nav">{userName}.</span>
          </h1>
          <p className="text-text/70 text-lg max-w-xl mt-6">
            Your personal hub for skill refinement. Upload your latest performance and let our AI provide tailored, expert feedback.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Action Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8 bg-white rounded-[32px] p-10 shadow-soft flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-soft text-nav rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-serif text-text mb-4">New Analysis</h2>
              <p className="text-text/70 mb-10 max-w-md text-lg leading-relaxed">
                Upload a video of your performance. We'll analyze your posture, timing, and technique to provide actionable insights.
              </p>
            </div>
            
            <button
              onClick={onStart}
              className="relative z-10 w-full sm:w-auto self-start px-8 py-4 bg-nav hover:bg-nav/90 text-white rounded-full font-medium flex items-center justify-center gap-3 transition-all duration-300 hover:gap-5 text-lg shadow-md hover:shadow-xl"
            >
              Begin Session <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-bg rounded-tl-[100px] -mr-10 -mb-10 opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
          </motion.div>

          {/* Stats & Progress */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-text rounded-[32px] p-8 text-white shadow-lg relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="font-medium text-white/60 flex items-center gap-2 text-xs uppercase tracking-widest">
                  <Activity className="w-4 h-4" /> Weekly Goal
                </h3>
                <button onClick={() => setIsEditingGoal(!isEditingGoal)} className="text-white/60 hover:text-white">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              {isEditingGoal ? (
                <input 
                  type="number"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(parseInt(e.target.value))}
                  className="bg-white/10 text-white text-5xl font-serif w-full p-2 rounded-lg mb-4"
                />
              ) : (
                <div className="flex items-baseline gap-2 mb-4 relative z-10">
                  <span className="text-5xl font-serif">{weeklyProgress}</span>
                  <span className="text-white/60 text-sm">/ {weeklyGoal} sessions</span>
                </div>
              )}
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative z-10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((weeklyProgress / weeklyGoal) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  className="h-full bg-white rounded-full" 
                />
              </div>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-nav rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            </motion.div>

            <div className="grid grid-cols-2 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="text-nav mb-3">
                  <Flame className="w-6 h-6" />
                </div>
                <div className="text-3xl font-serif text-text">{streak}</div>
                <div className="text-[10px] font-medium text-text/70 uppercase tracking-widest mt-2">Day Streak</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="text-nav mb-3">
                  <Target className="w-6 h-6" />
                </div>
                <div className="text-3xl font-serif text-text">{avgScore}</div>
                <div className="text-[10px] font-medium text-text/70 uppercase tracking-widest mt-2">Avg Score</div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
