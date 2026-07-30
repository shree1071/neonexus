"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingFlowProps {
  onComplete: () => void;
}

const steps = [
  {
    id: "welcome",
    video: "/mascots/pose-videos/pandi-pandi-whiteboard.webm",
    title: "Welcome to Fulcrum AI",
    description: "I'm Pandi, your personal learning assistant. Before we dive into physics and simulations, let's set up your profile.",
    buttonText: "Let's Go",
  },
  {
    id: "role",
    video: "/mascots/pose-videos/pandi-pandi-reading.webm",
    title: "What's your primary goal?",
    description: "This helps me tailor the simulations and explanations for you.",
    options: ["Learning Physics", "Teaching Students", "Researching Systems", "Just Exploring"],
    buttonText: "Continue",
  },
  {
    id: "ready",
    video: "/mascots/pose-videos/pandi-pandi-gaming.webm",
    title: "You're all set!",
    description: "Your workspace is ready. Let's start breaking the laws of physics... virtually, of course.",
    buttonText: "Enter Editor",
  },
];

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#070A0F]/80 backdrop-blur-xl">
      <motion.div
        layout
        className="w-full max-w-2xl overflow-hidden bg-white/5 border border-white/10 rounded-3xl shadow-2xl flex flex-col md:flex-row relative"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10 pointer-events-none" />

        {/* Mascot Area */}
        <div className="w-full md:w-5/12 bg-black/40 flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#070A0F] to-transparent opacity-50 md:opacity-0" />
          <AnimatePresence mode="wait">
            <motion.video
              key={step.video}
              src={step.video}
              autoPlay
              loop
              muted
              playsInline
              className="w-48 h-48 md:w-64 md:h-64 object-contain relative z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4 }}
            />
          </AnimatePresence>
        </div>

        {/* Content Area */}
        <div className="w-full md:w-7/12 p-8 md:p-10 flex flex-col justify-center relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              <div>
                <motion.h2 layout className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-2">
                  {step.title}
                </motion.h2>
                <motion.p layout className="text-sm md:text-base text-gray-400 leading-relaxed">
                  {step.description}
                </motion.p>
              </div>

              {step.options && (
                <div className="flex flex-col gap-3">
                  {step.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedOption(option)}
                      className={`text-left px-5 py-3 rounded-xl border transition-all duration-200 ${
                        selectedOption === option
                          ? "bg-indigo-500/20 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                          : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={step.options ? !selectedOption : false}
                  className="px-6 py-2.5 bg-white text-black font-medium rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  {step.buttonText}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
