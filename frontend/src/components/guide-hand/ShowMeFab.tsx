import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGuidanceStore } from '../../stores/guidanceStore';
import type { GuidanceWorkflow } from '../../types/guidance';

interface ShowMeFabProps {
  workflow: GuidanceWorkflow;
}

export default function ShowMeFab({ workflow }: ShowMeFabProps) {
  const { t } = useTranslation();
  const startWorkflow = useGuidanceStore(state => state.startWorkflow);
  const isActive = useGuidanceStore(state => state.isActive);
  const guidanceLevel = useGuidanceStore(state => state.guidanceLevel);

  if (isActive || guidanceLevel === 'off') return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => startWorkflow(workflow)}
      className="fixed bottom-24 right-6 z-40 bg-brand-dark text-white rounded-full p-4 shadow-xl flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors group"
      aria-label={t('guide.show_me') || 'Show Me'}
    >
      <HelpCircle className="w-6 h-6" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 font-bold text-sm">
        {t('guide.show_me') || 'Show Me'}
      </span>
    </motion.button>
  );
}
