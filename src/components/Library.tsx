import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, Loader2, BookOpen, Send, Sparkles } from "lucide-react";
import { askLibrary } from "../lib/gemini";
import Markdown from "react-markdown";

interface LibraryItem {
  id: string;
  question: string;
  answer: string;
  date: string;
}

export default function Library() {
  const [query, setQuery] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [history, setHistory] = useState<LibraryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("ai_skills_library");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse library history", e);
      }
    }
  }, []);

  const saveHistory = (newHistory: LibraryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem("ai_skills_library", JSON.stringify(newHistory));
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isAsking) return;

    const currentQuery = query.trim();
    setQuery("");
    setIsAsking(true);

    try {
      const answer = await askLibrary(currentQuery);
      const newItem: LibraryItem = {
        id: Date.now().toString(),
        question: currentQuery,
        answer,
        date: new Date().toISOString(),
      };
      saveHistory([newItem, ...history]);
    } catch (error) {
      console.error("Failed to ask library:", error);
      alert("Failed to get an answer. Please try again.");
    } finally {
      setIsAsking(false);
    }
  };

  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);

  if (selectedItem) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-bg p-6 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setSelectedItem(null)} className="mb-8 text-nav font-medium">← Back to Library</button>
          <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-start gap-5 mb-8 pb-8 border-b border-text/10">
              <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center shrink-0 border border-text/10">
                <span className="font-serif italic text-lg text-text/70">U</span>
              </div>
              <div>
                <h3 className="text-2xl font-serif text-text mb-2">{selectedItem.question}</h3>
                <p className="text-[10px] text-text/40 font-medium uppercase tracking-widest">
                  {new Date(selectedItem.date).toLocaleDateString(undefined, { 
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="prose prose-stone max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-headings:font-normal prose-a:text-accent">
                <Markdown>{selectedItem.answer}</Markdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-bg p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-text/10">
            <BookOpen className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-5xl font-serif text-text tracking-tight mb-6">
            Knowledge Library
          </h1>
          <p className="text-text/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Ask the Atelier Coach anything. From "basic locking skills" to "best tips for an interview", get instant expert advice.
          </p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
          onSubmit={handleAsk} 
          className="relative mb-16"
        >
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="w-6 h-6 text-text/40" />
          </div>
          <input
            type="text"
            placeholder="What skill do you want to master today?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isAsking}
            className="w-full bg-white border-none text-text rounded-full pl-16 pr-20 py-5 focus:ring-2 focus:ring-accent outline-none transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-xl font-serif disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!query.trim() || isAsking}
            className="absolute inset-y-2 right-2 px-6 bg-accent hover:bg-accent/90 disabled:bg-text/10 text-white rounded-full font-medium transition-colors flex items-center justify-center disabled:text-text/40"
          >
            {isAsking ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </motion.form>

        <div className="grid gap-4">
          {history.map((item, i) => (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-2xl p-6 shadow-soft text-left hover:scale-[1.01] transition-transform flex items-center justify-between"
            >
              <div className="flex-1 mr-4">
                <h3 className="text-lg font-serif text-text truncate">{item.question}</h3>
              </div>
              <p className="text-[10px] text-text/40 font-medium uppercase tracking-widest shrink-0">
                {new Date(item.date).toLocaleDateString(undefined, { 
                  month: 'short', day: 'numeric'
                })}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
