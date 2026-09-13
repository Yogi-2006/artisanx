import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';
import { useGuidance } from '../../hooks/useGuidance';

import SpotlightHighlight from './SpotlightHighlight';
import AnimatedHand from './AnimatedHand';
import InstructionCard from './InstructionCard';
import GuideControls from './GuideControls';
import GuideProgress from './GuideProgress';
import type { GestureType } from './AnimatedHand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function GuideHandOverlay() {
  const { t, i18n } = useTranslation();
  const { token, user } = useAuthStore();
  const guidance = useGuidance();
  
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [targetFound, setTargetFound] = useState<boolean>(true);
  const [showCompletion, setShowCompletion] = useState(false);

  const { 
    isActive, 
    status, 
    currentStep, 
    currentStepIndex, 
    totalSteps, 
    canGoNext, 
    canGoPrevious,
    currentWorkflow
  } = guidance;

  useEffect(() => {
    let isMounted = true;

    async function prepareStep() {
      if (!isActive || !currentStep || status === 'paused' || status === 'completed') {
        return;
      }

      setTargetRect(null);
      setTargetFound(true);

      if (currentStep.target_id) {
        // Wait for element to render
        const el = await guidance.waitForElement(currentStep.target_id, 3000);
        
        if (!isMounted) return;

        if (el) {
          guidance.scrollToTarget(currentStep.target_id);
          
          // Wait briefly for scroll to finish
          setTimeout(() => {
            if (isMounted) {
              setTargetRect(guidance.findTargetElement(currentStep.target_id));
            }
          }, 300);
          
        } else {
          setTargetFound(false);
          // Log missing target
          if (token && user) {
            try {
              axios.post(`${API_URL}/guidance/events`, {
                event_type: 'GUIDE_TARGET_NOT_FOUND',
                workflow_id: currentWorkflow?.id,
                step_id: currentStep.id,
                metadata: { target_id: currentStep.target_id }
              }, {
                headers: { Authorization: `Bearer ${token}` }
              }).catch(e => console.error(e));
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
    }

    prepareStep();

    // Recalculate rect on resize or scroll
    const handleRecalculate = () => {
      if (currentStep?.target_id && isMounted) {
        setTargetRect(guidance.findTargetElement(currentStep.target_id));
      }
    };

    window.addEventListener('resize', handleRecalculate);
    window.addEventListener('scroll', handleRecalculate, { passive: true, capture: true });

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleRecalculate);
      window.removeEventListener('scroll', handleRecalculate, { capture: true } as EventListenerOptions);
    };
  }, [isActive, currentStep, status, token, user, currentWorkflow]);

  // Handle completion animation
  useEffect(() => {
    if (status === 'completed' && isActive) {
      setShowCompletion(true);
      const timer = setTimeout(() => {
        setShowCompletion(false);
        guidance.skip(); // Close overlay completely
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, isActive]);

  if (!isActive) return null;

  // Determine instruction language
  const currentLang = i18n.language.split('-')[0];
  let instruction = '';
  if (currentStep) {
    const key = `instruction_${currentLang}` as keyof typeof currentStep;
    instruction = (currentStep[key] as string) || currentStep.instruction_en || '';
  }

  const fallbackInstruction = t('guide.fallback_instruction') || "We couldn't find the exact button, but you can proceed to the next step.";

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      
      {/* Completion Animation */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 pointer-events-auto"
          >
            <motion.div 
              initial={{ rotate: -90 }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="bg-white p-6 rounded-full shadow-2xl mb-4"
            >
              <CheckCircle className="w-20 h-20 text-green-500" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white tracking-wide">
              {t('guide.completed') || 'Guide Completed!'}
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {status !== 'completed' && !showCompletion && (
        <>
          <SpotlightHighlight 
            targetRect={targetRect} 
            onClickOverlay={() => { /* optional skip or ignore */ }} 
          />
          
          <AnimatePresence mode="wait">
            {targetFound && targetRect && currentStep && (
              <AnimatedHand 
                key={currentStep.id}
                gesture={(currentStep.gesture_type || 'point') as GestureType}
                position={{
                  x: Math.min(Math.max(10, targetRect.left + (targetRect.width / 2) - 24), window.innerWidth - 48), // Center hand but keep in bounds
                  y: Math.min(targetRect.bottom + 10, window.innerHeight - 60) // Below element but keep in bounds
                }}
              />
            )}
          </AnimatePresence>

          {currentStep && (
            <InstructionCard 
              text={targetFound ? instruction : fallbackInstruction}
              stepNumber={currentStepIndex + 1}
              totalSteps={totalSteps}
              targetRect={targetFound ? targetRect : null}
            />
          )}

          <div className="fixed bottom-32 left-0 right-0 flex justify-center z-50">
            <div className="bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-lg pointer-events-auto">
              <GuideProgress 
                currentStep={currentStepIndex + 1} 
                totalSteps={totalSteps} 
                stepLabel={currentStep?.screen_name}
              />
            </div>
          </div>

          <GuideControls 
            canGoNext={canGoNext}
            canGoPrevious={canGoPrevious}
            isPaused={status === 'paused'}
            onNext={guidance.nextStep}
            onPrevious={guidance.previousStep}
            onPause={() => status === 'paused' ? guidance.resume() : guidance.pause()}
            onSkip={guidance.skip}
            onReplay={guidance.replay}
            onDontShowAgain={(checked) => {
              if (checked && currentWorkflow) {
                guidance.markDontShowAgain(currentWorkflow.id);
                guidance.skip();
              }
            }}
          />
        </>
      )}
    </div>,
    document.body
  );
}
