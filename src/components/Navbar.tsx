import React from "react";
import { motion } from "motion/react";
import { Home, History, BookOpen, Map, Bell } from "lucide-react";
import { cn } from "../lib/utils";

export type MainTab = "home" | "history" | "library" | "roadmap";

interface NavbarProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  userName: string;
  userEmoji: string;
}

export default function Navbar({ activeTab, onTabChange, userName, userEmoji }: NavbarProps) {
  const tabs: { id: MainTab; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Home", icon: <Home className="w-4 h-4" /> },
    { id: "roadmap", label: "Roadmap", icon: <Map className="w-4 h-4" /> },
    { id: "history", label: "History", icon: <History className="w-4 h-4" /> },
    { id: "library", label: "Library", icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-text/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-serif italic text-lg">
            S
          </div>
          <span className="font-serif text-2xl tracking-tight text-text hidden sm:block">SkillUp</span>
        </div>

        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all",
                  isActive ? "text-white bg-accent" : "text-accent hover:bg-text/5"
                )}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon}
                  <span className="hidden sm:block">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-accent hover:bg-text/5 transition-colors rounded-full">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-bg"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-text/10">
            <div className="text-right hidden md:block">
              <div className="text-sm font-serif font-medium text-text">{userName || "Guest"}</div>
              <div className="text-xs text-text/70 uppercase tracking-widest">Member</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center text-xl border border-text/10">
              {userEmoji}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
