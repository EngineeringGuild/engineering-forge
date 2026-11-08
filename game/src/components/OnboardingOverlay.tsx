import { useState } from 'react';
import {
  ONBOARDING_CONFIG,
  ONBOARDING_STORAGE_PREFIX,
  isOnboardingEligibleLevel,
  type OnboardingStep,
} from '../content/onboardingData';

export type { OnboardingStep };

export interface OnboardingOverlayProps {
  discipline: 'structures' | 'circuits' | 'vehicles';
  levelId: string;
  onDismiss?: () => void;
}

function checkShouldShowOnboarding(discipline: string, levelId: string): boolean {
  if (typeof window === 'undefined') return false;
  if (!isOnboardingEligibleLevel(levelId)) return false;
  try {
    const key = `${ONBOARDING_STORAGE_PREFIX}${discipline}`;
    return !localStorage.getItem(key);
  } catch {
    return false;
  }
}

export function OnboardingOverlay({ discipline, levelId, onDismiss }: OnboardingOverlayProps) {
  const storageKey = `${ONBOARDING_STORAGE_PREFIX}${discipline}`;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Adjust state during render when level or discipline changes (React 19 pattern)
  const [prevContext, setPrevContext] = useState({ discipline, levelId });
  const [isVisible, setIsVisible] = useState(() =>
    checkShouldShowOnboarding(discipline, levelId)
  );

  if (prevContext.discipline !== discipline || prevContext.levelId !== levelId) {
    setPrevContext({ discipline, levelId });
    setIsVisible(checkShouldShowOnboarding(discipline, levelId));
    setCurrentStepIndex(0);
  }

  if (!isVisible) return null;

  const steps = ONBOARDING_CONFIG[discipline];
  const step = steps[currentStepIndex];
  const isLast = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      // Fallback
    }
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative flex w-full max-w-md flex-col rounded-2xl border border-accent/40 bg-card p-6 shadow-2xl font-mono text-xs">
        {/* Step indicator header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/80">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-sm border border-accent/30 text-accent">
              {step.icon}
            </span>
            <span className="font-bold uppercase tracking-wider text-[11px] text-accent">
              Quick Start Guide · Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>

          <button
            onClick={handleComplete}
            className="rounded p-1 text-fg-muted hover:text-fg text-xs"
            title="Skip onboarding"
          >
            ✕ Skip
          </button>
        </div>

        {/* Highlight Banner */}
        <div className="my-4 rounded-xl border border-accent/30 bg-accent/10 px-3.5 py-2.5 flex items-center gap-2.5">
          <span className="text-base">🎯</span>
          <div>
            <span className="text-[10px] uppercase font-bold text-accent tracking-wider block">
              Key Mechanism
            </span>
            <span className="text-xs font-semibold text-fg">{step.highlightText}</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 id="onboarding-title" className="font-display text-lg font-bold text-fg">
            {step.title}
          </h3>
          <p className="font-sans text-xs text-fg-muted leading-relaxed">
            {step.description}
          </p>

          {step.tip && (
            <div className="rounded-lg border border-border/80 bg-surface-2/60 p-2.5">
              <span className="text-[10px] text-fg-subtle font-bold uppercase block mb-0.5">
                Pro-Tip
              </span>
              <p className="text-[11px] text-fg-muted">{step.tip}</p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex items-center justify-between pt-3 border-t border-border/80">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStepIndex ? 'w-5 bg-accent' : 'w-2 bg-border'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-fg-muted hover:text-fg transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="rounded-lg bg-accent px-4 py-1.5 font-bold text-xs text-accent-fg hover:opacity-90 shadow-sm transition-opacity"
            >
              {isLast ? 'Start Building! 🚀' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
