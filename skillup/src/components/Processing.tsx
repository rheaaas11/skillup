import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Loader2, Sparkles } from "lucide-react";

const FUN_FACTS: Record<string, string[]> = {
  "Public Speaking": [
    "Did you know? The fear of public speaking is called glossophobia.",
    "Eye contact with your audience can increase their retention of your message by up to 30%.",
    "Using pauses effectively can make you sound more confident and authoritative."
  ],
  "Dance": [
    "Dancing can improve your memory and prevent you from developing dementia as you get older.",
    "The world record for the longest dance marathon is 123 hours and 15 minutes.",
    "Ballet dancers can carry up to 3 times their body weight on the tip of their big toe."
  ],
  "Golf Swing": [
    "A golf ball has on average 336 dimples, which help it fly further and straighter.",
    "The longest recorded drive in a professional tournament was 515 yards.",
    "Tiger Woods made his first hole-in-one at the age of eight."
  ],
  "Tennis Serve": [
    "The fastest recorded tennis serve was 163.7 mph (263.4 km/h) by Sam Groth.",
    "Yellow tennis balls were introduced in 1972 to be more visible on color TV.",
    "A good serve requires the coordination of over 100 different muscles."
  ],
  "Basketball Shooting": [
    "The highest scoring NBA game was 186-184 in 1983.",
    "The backboard was originally added to prevent fans in the balcony from interfering with the ball.",
    "Stephen Curry holds the record for the most three-pointers made in NBA history."
  ],
  "Job Interview": [
    "It takes an average of 7 seconds for an interviewer to make a first impression.",
    "Mirroring the interviewer's body language slightly can build rapport.",
    "Asking thoughtful questions at the end of an interview increases your chances of getting hired."
  ],
  "Presentation": [
    "People remember 10% of what they hear, 20% of what they read, and 80% of what they see and do.",
    "The 10/20/30 rule of PowerPoint: 10 slides, 20 minutes, 30-point font.",
    "Storytelling can make your presentation up to 22 times more memorable."
  ],
  "Yoga Pose": [
    "Yoga is over 5,000 years old and originated in Northern India.",
    "There are over 100 different types of yoga.",
    "Regular yoga practice can increase flexibility, muscle strength, and tone."
  ]
};

interface ProcessingProps {
  skill: string;
}

export default function Processing({ skill }: ProcessingProps) {
  const [factIndex, setFactIndex] = useState(0);
  const facts = FUN_FACTS[skill] || FUN_FACTS["Public Speaking"];

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % facts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [facts.length]);

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-nav rounded-full blur-[100px]"
      />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <div className="w-28 h-28 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center mb-10 relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-text/10 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-2 border-nav rounded-full border-t-transparent border-l-transparent"
          />
          <Sparkles className="w-8 h-8 text-nav" />
        </div>

        <h2 className="text-4xl font-serif text-text mb-4">
          Analyzing {skill}
        </h2>
        <p className="text-text/70 mb-12 flex items-center gap-3 text-lg">
          <Loader2 className="w-5 h-5 animate-spin text-nav" />
          SkillUp coach processing...
        </p>

        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[24px] border border-text/10 shadow-sm w-full relative overflow-hidden">
          <div className="text-[10px] font-medium text-text/70 uppercase tracking-widest mb-4">
            Did you know?
          </div>
          <motion.p
            key={factIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-text leading-relaxed font-serif text-lg italic"
          >
            "{facts[factIndex]}"
          </motion.p>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-bg rounded-full opacity-50 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}
