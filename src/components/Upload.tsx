import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { UploadCloud, Video, X, CheckCircle2, AlertCircle, Camera, ArrowRight } from "lucide-react";

const SKILLS = [
  "Public Speaking",
  "Dance",
  "Golf Swing",
  "Tennis Serve",
  "Basketball Shooting",
  "Job Interview",
  "Presentation",
  "Yoga Pose",
  "Custom",
];

interface UploadProps {
  onAnalyze: (file: File, skill: string) => void;
  onBack: () => void;
  fixedSkill?: string;
}

export default function Upload({ onAnalyze, onBack, fixedSkill }: UploadProps) {
  const [skill, setSkill] = useState(fixedSkill || SKILLS[0]);
  const [customSkill, setCustomSkill] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile);
      setError("");
    } else {
      setError("Please upload a valid video file.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please select a valid video file.");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const recordedFile = new File([blob], "recording.webm", { type: "video/webm" });
        setFile(recordedFile);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      setError("Could not access camera or microphone.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-bg flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-full max-w-2xl bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 lg:p-12 relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-10 relative z-10">
          <h2 className="text-3xl font-serif text-text">Upload Performance</h2>
          <button onClick={onBack} className="text-nav hover:bg-bg transition-colors p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-8 relative z-10">
          {!fixedSkill && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-text/70 uppercase tracking-widest mb-3">
                Select Skill to Analyze
              </label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full bg-bg border-none text-text rounded-xl px-5 py-4 focus:ring-2 focus:ring-nav outline-none transition-all text-lg font-serif"
              >
                {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {skill === "Custom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4"
                >
                  <input
                    type="text"
                    placeholder="e.g. Playing Guitar, Juggling, Coding..."
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    className="w-full bg-bg border-none text-text rounded-xl px-5 py-4 focus:ring-2 focus:ring-nav outline-none transition-all text-lg font-serif"
                  />
                </motion.div>
              )}
            </motion.div>
          )}

          {!file && !isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-text/10 rounded-[24px] p-12 text-center hover:bg-bg transition-colors cursor-pointer relative group"
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-16 h-16 bg-white text-nav rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-text/10 group-hover:scale-110 transition-transform duration-300">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif text-text mb-2">Drag & drop your video</h3>
              <p className="text-text/70 mb-8">MP4, WebM or MOV up to 50MB</p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <span className="text-sm font-medium text-text bg-white border border-text/10 px-6 py-3 rounded-full shadow-sm hover:bg-bg transition-colors">
                  Browse Files
                </span>
                <span className="text-text/40 font-serif italic">or</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    startRecording();
                  }}
                  className="text-sm font-medium text-white bg-nav px-6 py-3 rounded-full hover:bg-nav/90 transition-colors flex items-center gap-2 relative z-10"
                >
                  <Camera className="w-4 h-4" /> Record Now
                </button>
              </div>
            </motion.div>
          )}

          {isRecording && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded-[24px] overflow-hidden bg-text relative aspect-video shadow-lg"
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-6 right-6 bg-nav text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 animate-pulse shadow-md">
                <div className="w-2 h-2 bg-white rounded-full" />
                {formatTime(recordingTime)}
              </div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 bg-nav rounded-full border-4 border-white/20 flex items-center justify-center hover:bg-nav/90 transition-colors shadow-lg"
                >
                  <div className="w-8 h-8 bg-white rounded-sm" />
                </button>
              </div>
            </motion.div>
          )}

          {file && !isRecording && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg rounded-[24px] p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-white text-nav rounded-full flex items-center justify-center shadow-sm">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-text flex items-center gap-2 text-lg">
                    {file.name} <CheckCircle2 className="w-5 h-5 text-success" />
                  </h4>
                  <p className="text-sm text-text/70">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-text/70 hover:bg-bg transition-colors p-3 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-nav text-sm bg-nav/10 p-4 rounded-xl font-medium"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            disabled={!file || (skill === "Custom" && !customSkill.trim())}
            onClick={() => file && onAnalyze(file, skill === "Custom" ? customSkill.trim() : skill)}
            className="w-full py-5 bg-nav hover:bg-nav/90 disabled:bg-text/10 disabled:text-text/40 text-white rounded-full font-medium transition-colors flex items-center justify-center gap-3 text-lg group"
          >
            Analyze Performance <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
        
        {/* Decorative element */}
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-bg rounded-tl-[100px] -mr-10 -mb-10 opacity-50 pointer-events-none"></div>
      </motion.div>
    </div>
  );
}
