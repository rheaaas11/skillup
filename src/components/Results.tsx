import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle, XCircle, TrendingUp, Youtube, Target, Award, Clock, Trophy, BookOpen, AlertTriangle } from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
import type { AnalysisResult } from "../lib/gemini";
import { cn } from "../lib/utils";

interface ResultsProps {
  result: AnalysisResult;
  skill: string;
  videoUrl?: string | null;
  onReset: () => void;
}

type TabType = "general" | "timeline" | "drills" | "expert" | "library";

export default function Results({ result, skill, videoUrl, onReset }: ResultsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const data = [
    { name: "Score", value: result?.score || 0, fill: "var(--color-nav)" },
  ];

  const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Target className="w-4 h-4" /> },
    { id: "timeline", label: "Timeline", icon: <Clock className="w-4 h-4" /> },
    { id: "drills", label: "Drills", icon: <Youtube className="w-4 h-4" /> },
    { id: "expert", label: "Personalised Feedback", icon: <Trophy className="w-4 h-4" /> },
    { id: "library", label: "Skill Library", icon: <BookOpen className="w-4 h-4" /> },
  ];

  const parseTime = (timeStr: string) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return parseInt(timeStr) || 0;
  };

  const handleSeek = (timeStr: string) => {
    if (videoRef.current) {
      const timeInSeconds = parseTime(timeStr);
      videoRef.current.currentTime = timeInSeconds;
      videoRef.current.play().catch(e => console.log("Playback failed:", e));
    }
  };

  const progressPercent = duration > 0 ? `${(currentTime / duration) * 100}%` : "0%";

  return (
    <div className="min-h-screen bg-bg p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <div>
            <button
              onClick={onReset}
              className="text-nav hover:text-text flex items-center gap-2 mb-4 transition-colors font-medium uppercase tracking-widest text-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Atelier
            </button>
            <h1 className="text-4xl lg:text-5xl font-serif text-text tracking-tight">
              Your {skill} Analysis
            </h1>
          </div>
          <div className="hidden lg:flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-text/10">
            <Award className="w-5 h-5 text-accent" />
            <span className="font-serif italic text-text">Atelier Coach</span>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Video & Score */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-28 space-y-6">
              {/* Video Player */}
              <div className="bg-text rounded-[32px] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="aspect-video bg-black rounded-[20px] overflow-hidden relative shadow-inner">
                  {videoUrl ? (
                    <video 
                      ref={videoRef}
                      src={videoUrl} 
                      controls 
                      playsInline
                      onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-text/80">
                      <span className="text-text/50 font-serif italic">Video not available for past history</span>
                    </div>
                  )}
                </div>
                {/* Mini Timeline Track */}
                <div className="mt-4 px-2">
                  <div className="relative h-1.5 bg-text/20 rounded-full">
                    <div 
                      className="absolute inset-y-0 left-0 bg-nav rounded-full transition-all duration-75" 
                      style={{ width: progressPercent }} 
                    />
                    {result.timeline?.map((item, i) => {
                      const isMistake = item.type === "mistake";
                      const isWarning = item.type === "warning";
                      const timeInSeconds = parseTime(item.time);
                      const leftPercent = duration > 0 
                        ? `${Math.min(100, Math.max(0, (timeInSeconds / duration) * 100))}%` 
                        : `${(i + 1) * (100 / (result.timeline.length + 1))}%`;

                      return (
                        <div 
                          key={i} 
                          onClick={() => handleSeek(item.time)}
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer group"
                          style={{ left: leftPercent }}
                        >
                          <div className={cn(
                            "w-3 h-3 rounded-full border-2 border-text flex items-center justify-center shadow-sm transition-transform group-hover:scale-125",
                            isMistake ? "bg-accent" : isWarning ? "bg-accent/80" : "bg-success"
                          )} />
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white text-text p-3 rounded-[12px] shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            <div className="font-serif font-bold text-xs mb-1 text-accent">{item.time}</div>
                            <div className="text-xs leading-relaxed text-text/70 line-clamp-2">{item.description}</div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Score Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center"
              >
                <h2 className="text-sm font-medium text-text/70 uppercase tracking-widest mb-4">Overall Score</h2>
                <div className="w-40 h-40 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="70%"
                      outerRadius="100%"
                      barSize={12}
                      data={data}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        angleAxisId={0}
                        tick={false}
                      />
                      <RadialBar
                        background={{ fill: "var(--color-bg)" }}
                        dataKey="value"
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-serif text-text tracking-tighter">
                      {result?.score || 0}
                    </span>
                    <span className="text-[10px] font-medium text-text/40 uppercase tracking-widest mt-1">/ 100</span>
                  </div>
                </div>
                <p className="mt-6 text-text font-medium text-base italic">
                  {(result?.score || 0) >= 80 ? "Excellent performance!" : (result?.score || 0) >= 60 ? "Good, but room for improvement." : "Needs practice."}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Tabs & Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto pb-2 hide-scrollbar gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-nav text-white shadow-md"
                      : "bg-white text-nav hover:bg-bg border border-text/10"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div
              key={activeTab}
              className="bg-white rounded-[32px] p-8 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px]"
            >
              {activeTab === "general" && (
                <div className="space-y-12">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-bg rounded-[24px] p-8">
                      <h3 className="flex items-center gap-3 text-text font-serif text-2xl mb-6">
                        <CheckCircle className="w-6 h-6 text-success" /> Strengths
                      </h3>
                      <ul className="space-y-4">
                        {result?.strengths?.map((str, i) => (
                          <li key={i} className="flex items-start gap-4 text-text/70">
                            <div className="w-1.5 h-1.5 rounded-full bg-success mt-2.5 shrink-0" />
                            <span className="leading-relaxed">{str}</span>
                          </li>
                        )) || <li className="text-text/50 italic">No strengths identified yet.</li>}
                      </ul>
                    </div>
                    <div className="bg-bg rounded-[24px] p-8">
                      <h3 className="flex items-center gap-3 text-text font-serif text-2xl mb-6">
                        <XCircle className="w-6 h-6 text-accent" /> Areas to Improve
                      </h3>
                      <ul className="space-y-4">
                        {result?.weaknesses?.map((wk, i) => (
                          <li key={i} className="flex items-start gap-4 text-text/70">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" />
                            <span className="leading-relaxed">{wk}</span>
                          </li>
                        )) || <li className="text-text/50 italic">No areas to improve identified yet.</li>}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h2 className="flex items-center gap-3 text-3xl font-serif text-text mb-8">
                      <Target className="w-8 h-8 text-accent" />
                      Improvement Plan
                    </h2>
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-text/10">
                      {result?.improvement_plan?.map((step, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-nav text-white font-serif italic text-lg shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            {i + 1}
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-bg p-6 rounded-[24px]">
                            <p className="text-text/70 leading-relaxed">{step}</p>
                          </div>
                        </div>
                      )) || <p className="text-text/50 italic text-center py-8">No improvement plan available.</p>}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "timeline" && (
                <div>
                  <div className="mb-10">
                    <h2 className="text-3xl font-serif text-text mb-3">Mistake Timeline</h2>
                    <p className="text-text/70">Every error is timestamped on your video. Click any marker to jump straight to that moment.</p>
                  </div>
                  
                  <div className="bg-text rounded-[32px] p-8 lg:p-10 text-white">
                    {/* Timeline List */}
                    <div className="space-y-4">
                      {result.timeline?.map((item, i) => (
                        <div 
                          key={i} 
                          onClick={() => handleSeek(item.time)}
                          className="flex items-start gap-5 p-5 rounded-[20px] bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                        >
                          <div className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold shrink-0 mt-0.5 tracking-widest uppercase",
                            item.type === "mistake" ? "bg-accent/20 text-accent" : 
                            item.type === "warning" ? "bg-accent/20 text-accent" : 
                            "bg-success/20 text-success"
                          )}>
                            {item.time}
                          </div>
                          <div>
                            <p className="text-white/80 leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "drills" && (
                <div>
                  <h2 className="text-3xl font-serif text-text mb-10">Implementation Plan</h2>
                  <div className="grid gap-8">
                    {result.drills?.map((drill, i) => (
                      <div key={i} className="bg-bg p-8 rounded-[24px] flex flex-col sm:flex-row gap-8 items-start">
                        <div className="w-14 h-14 bg-nav text-white rounded-full flex items-center justify-center font-serif italic text-2xl shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-serif text-text mb-3">{drill.title}</h3>
                          <p className="text-text/70 leading-relaxed mb-6">{drill.description}</p>
                          <a 
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(drill.link)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-text hover:bg-text/5 bg-white px-6 py-3 rounded-full transition-colors shadow-sm"
                          >
                            <Youtube className="w-4 h-4 text-accent" /> Watch Tutorial
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "expert" && (
                <div className="h-full flex flex-col">
                  <div className="bg-text rounded-[32px] p-8 lg:p-10 text-white relative overflow-hidden flex-1 flex flex-col justify-center">
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-8">
                        <Trophy className="w-8 h-8 text-accent" />
                      </div>
                      <h2 className="text-3xl font-serif mb-6">Personalised Feedback</h2>
                      <p className="text-xl text-white/80 leading-relaxed font-serif italic">
                        "{result?.expert_feedback || "No feedback available at this time."}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "library" && (
                <div>
                  <div className="mb-10 flex items-center gap-5">
                    <div className="w-16 h-16 bg-bg text-nav rounded-full flex items-center justify-center shrink-0">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-serif text-text">Skill Library</h2>
                      <p className="text-text/70 mt-2">Browse technique guides, expert tips, and common mistakes.</p>
                    </div>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-8">
                    {result?.skill_library?.map((item, i) => (
                      <div key={i} className="bg-bg rounded-[24px] p-8">
                        <h3 className="font-serif text-text mb-4 text-2xl">{item.title}</h3>
                        <p className="text-text/70 leading-relaxed">{item.content}</p>
                      </div>
                    )) || <p className="text-text/50 italic col-span-2 text-center py-8">No library content available.</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

