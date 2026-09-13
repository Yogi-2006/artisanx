import { motion, useReducedMotion } from 'framer-motion';
import { Hand, Pointer } from 'lucide-react'; // Alternatively, custom SVGs could be used, but lucide-react is the project standard

export type GestureType = 'point' | 'tap' | 'swipe' | 'scroll' | 'highlight';

interface AnimatedHandProps {
  gesture: GestureType;
  position?: { x: number; y: number };
  size?: number;
  color?: string;
}

export default function AnimatedHand({ 
  gesture, 
  position = { x: 0, y: 0 }, 
  size = 48, 
  color = '#d97706' // Warm amber
}: AnimatedHandProps) {
  const prefersReducedMotion = useReducedMotion();

  // Base variants for entrance/exit
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  // Specific gesture animations
  const gestureAnimations = {
    point: {
      y: [0, -10, 0],
      transition: { repeat: Infinity, duration: 1.5 }
    },
    tap: {
      scale: [1, 0.8, 1],
      transition: { repeat: Infinity, duration: 1 }
    },
    swipe: {
      x: [-20, 20, -20],
      transition: { repeat: Infinity, duration: 2 }
    },
    scroll: {
      y: [-20, 20, -20],
      transition: { repeat: Infinity, duration: 2 }
    },
    highlight: {
      scale: [1, 1.1, 1],
      filter: ['drop-shadow(0px 0px 0px rgba(217, 119, 6, 0))', 'drop-shadow(0px 0px 15px rgba(217, 119, 6, 0.8))', 'drop-shadow(0px 0px 0px rgba(217, 119, 6, 0))'],
      transition: { repeat: Infinity, duration: 1.5 }
    }
  };

  const getIcon = () => {
    switch (gesture) {
      case 'point':
      case 'tap':
      case 'highlight':
        return <Pointer size={size} color={color} fill={color} strokeWidth={1} />;
      case 'swipe':
      case 'scroll':
        return <Hand size={size} color={color} fill="transparent" strokeWidth={1.5} />;
      default:
        return <Pointer size={size} color={color} fill={color} strokeWidth={1} />;
    }
  };

  const currentAnimation = prefersReducedMotion ? { opacity: [0.8, 1, 0.8], transition: { repeat: Infinity, duration: 2 } } : gestureAnimations[gesture];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: 'absolute',
        top: position.y,
        left: position.x,
        zIndex: 50,
        pointerEvents: 'none' // Let clicks pass through
      }}
    >
      <motion.div animate={currentAnimation}>
        {getIcon()}
        {gesture === 'tap' && !prefersReducedMotion && (
          <motion.div
            style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '80%',
              height: '80%',
              borderRadius: '50%',
              backgroundColor: color,
              zIndex: -1
            }}
            animate={{
              scale: [1, 2],
              opacity: [0.5, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 1,
              ease: "easeOut"
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
