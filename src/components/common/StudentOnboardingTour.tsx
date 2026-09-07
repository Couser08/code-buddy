import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check, X, Code2, Terminal, CornerDownLeft, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  title: string;
  subtitle: string;
  hinglishDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Live Teacher Code Stream',
    subtitle: 'Real-time Netcode Synchronization',
    hinglishDesc: 'Namaste! Yahan Rahul Sir ka live C code real-time bina kisi lag ya delay ke aapki screen par sync hoga. "Following Teacher" mode se aap sir ke cursor aur scroll ko live follow kar sakte ho.',
    icon: Code2,
    tag: 'Step 1 of 4 • Code Sync',
  },
  {
    title: 'Split-Screen Output Terminal',
    subtitle: 'Side-by-Side Live Compiler Output',
    hinglishDesc: 'Ab aapko code dekhne aur output check karne ke liye tab switch karne ki zaroorat nahi hai. Split-screen me right side par live GCC compiler ka output, CPU execution time aur memory usage real-time dikhega.',
    icon: Terminal,
    tag: 'Step 2 of 4 • Split View',
  },
  {
    title: 'Interactive Stdin (scanf() Support)',
    subtitle: 'Live Terminal Input Made Easy',
    hinglishDesc: 'Agar C program me scanf(), getchar(), ya fgets() use ho raha hai, toh Terminal ke bottom me diye gaye interactive prompt me values enter karein aur Enter dabayein. Program real terminal ki tarah smoothly input read karega!',
    icon: CornerDownLeft,
    tag: 'Step 3 of 4 • scanf Support',
  },
  {
    title: 'Live Doubts Floating Action Button',
    subtitle: 'Direct Push to Instructor Queue',
    hinglishDesc: 'Class ke dauran koi bhi doubt ya question aaye, toh screen ke bottom-right me diye gaye "Ask Doubt" floating button par tap karein. Aapka sawaal turant sir ke live doubt queue me pahunch jayega!',
    icon: HelpCircle,
    tag: 'Step 4 of 4 • Live Doubts',
  },
];

interface StudentOnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentOnboardingTour: React.FC<StudentOnboardingTourProps> = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const Icon = currentStep.icon;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-white rounded-[32px] p-7 shadow-2xl border border-slate-200/90 relative overflow-hidden"
      >
        {/* Subtle decorative gradient background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-500/10 via-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100/80">
              {currentStep.tag}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            title="Skip Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Body Content */}
        <div className="py-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {currentStep.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          {/* Hinglish Explanation Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 text-sm leading-relaxed font-medium">
            <p>{currentStep.hinglishDesc}</p>
          </div>
        </div>

        {/* Bottom Actions & Step Dots */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {/* Progress Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-6 bg-blue-600'
                    : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Peeche</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-full shadow-md transition-all cursor-pointer active:scale-98"
            >
              <span>{isLast ? 'Samajh Gaya (Done)!' : 'Aage Badho'}</span>
              {isLast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
