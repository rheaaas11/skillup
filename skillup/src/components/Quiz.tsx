import React, { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { type QuizQuestion } from "./Roadmap";

interface QuizProps {
  questions: QuizQuestion[];
  onComplete: () => void;
}

export default function Quiz({ questions, onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setIsCorrect(index === questions[currentQuestion].correctAnswer);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      onComplete();
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-text/10">
      <h2 className="text-2xl font-serif text-text mb-8">Quiz: {questions[currentQuestion].question}</h2>
      
      <div className="space-y-4 mb-8">
        {questions[currentQuestion].options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={selectedAnswer !== null}
            className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
              selectedAnswer === index
                ? isCorrect
                  ? "border-success bg-success/10"
                  : "border-nav bg-nav/10"
                : "border-text/10 hover:border-nav"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {selectedAnswer !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className={`flex items-center gap-2 font-medium ${isCorrect ? "text-success" : "text-nav"}`}>
            {isCorrect ? <CheckCircle2 /> : <XCircle />}
            {isCorrect ? "Correct!" : "Incorrect."}
          </div>
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-nav text-white rounded-full font-medium hover:bg-nav/90 transition-colors flex items-center gap-2"
          >
            {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
