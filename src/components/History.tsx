import React from "react";
import { motion } from "motion/react";
import { Clock, ChevronRight, Target, Trash2 } from "lucide-react";
import type { AnalysisResult } from "../lib/gemini";

export interface HistoryItem {
  id: string;
  date: string;
  skill: string;
  result: AnalysisResult;
}

interface HistoryProps {
  history: HistoryItem[];
  onViewResult: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export default function History({ history, onViewResult, onClearHistory }: HistoryProps) {
  if (history.length === 0) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-bg flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm border border-text/10"
        >
          <Clock className="w-8 h-8 text-accent" />
        </motion.div>
        <h2 className="text-3xl font-serif text-text mb-3">No History Yet</h2>
        <p className="text-text/70 text-center max-w-sm text-lg">
          Upload and analyze a video to see your past performance and improvement over time.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-bg p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-serif text-text tracking-tight">Your History</h1>
          <button
            onClick={onClearHistory}
            className="text-sm font-medium text-accent hover:bg-accent/10 px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 border border-accent/20"
          >
            <Trash2 className="w-4 h-4" /> Clear History
          </button>
        </div>

        <div className="grid gap-6">
          {history.map((item, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 20 }}
              key={item.id}
              onClick={() => onViewResult(item)}
              className="bg-white rounded-[24px] p-6 flex items-center justify-between cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-bg flex flex-col items-center justify-center shrink-0 border border-text/10">
                  <span className="text-3xl font-serif text-text leading-none">{item.result.score}</span>
                  <span className="text-[10px] font-medium text-text/70 uppercase tracking-widest mt-1">Score</span>
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-text mb-2 flex items-center gap-3">
                    <Target className="w-5 h-5 text-accent" />
                    {item.skill}
                  </h3>
                  <p className="text-sm text-text/70 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(item.date).toLocaleDateString(undefined, { 
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center group-hover:bg-accent transition-colors border border-text/10">
                <ChevronRight className="w-6 h-6 text-accent group-hover:text-white" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
