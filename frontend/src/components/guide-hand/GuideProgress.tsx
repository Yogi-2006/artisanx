import { motion } from 'framer-motion';

interface GuideProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
}

export default function GuideProgress({ currentStep, totalSteps, stepLabel }: GuideProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center pointer-events-none">
      <div className="flex items-center gap-2 mb-1">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <motion.div
              key={stepNum}
              initial={false}
              animate={{
                scale: isCurrent ? 1.2 : 1,
                backgroundColor: isCurrent || isCompleted ? '#d97706' : 'transparent',
                borderColor: isCurrent || isCompleted ? '#d97706' : '#d6d3d1'
              }}
              className="w-2.5 h-2.5 rounded-full border-2 transition-colors duration-300"
            />
          );
        })}
      </div>
      {stepLabel && (
        <motion.div 
          key={stepLabel}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-bold text-stone-500 uppercase tracking-wider"
        >
          {stepLabel}
        </motion.div>
      )}
    </div>
  );
}
