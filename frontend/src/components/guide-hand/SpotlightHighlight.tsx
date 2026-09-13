import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface SpotlightHighlightProps {
  targetRect?: DOMRect | null;
  padding?: number;
  borderRadius?: number;
  onClickOverlay?: () => void;
}

export default function SpotlightHighlight({
  targetRect,
  padding = 8,
  borderRadius = 12,
  onClickOverlay
}: SpotlightHighlightProps) {
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Default values if no target
  const x = targetRect ? targetRect.x - padding : windowSize.w / 2;
  const y = targetRect ? targetRect.y - padding : windowSize.h / 2;
  const width = targetRect ? targetRect.width + padding * 2 : 0;
  const height = targetRect ? targetRect.height + padding * 2 : 0;
  
  // Only show the cutout if there's an actual target
  const showCutout = targetRect !== null && targetRect !== undefined;

  return (
    <div 
      className="fixed inset-0 z-40 pointer-events-auto"
      onClick={onClickOverlay}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="spotlight-mask">
            {/* White covers everything, meaning "show overlay" */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            
            {/* Black cuts out the hole, meaning "hide overlay here" */}
            {showCutout && (
              <motion.rect
                fill="black"
                rx={borderRadius}
                ry={borderRadius}
                animate={{
                  x,
                  y,
                  width,
                  height
                }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 20,
                  mass: 0.8
                }}
              />
            )}
          </mask>
        </defs>

        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.6)"
          mask="url(#spotlight-mask)"
        />
      </svg>
      
      {/* Invisible overlay over the cutout itself so clicks on the target can be intercepted if we want,
          but usually we want to let clicks pass through to the actual element.
          With the current setup, the SVG covers the screen. But wait, `pointer-events-auto` on the container
          blocks clicks to the element underneath. 
          If we want the spotlight to let clicks pass through to the target element:
      */}
      {showCutout && (
        <motion.div
          style={{
            position: 'absolute',
            pointerEvents: 'none' // Allow clicking the actual element
          }}
          animate={{
            top: y,
            left: x,
            width,
            height
          }}
          transition={{ type: 'spring', stiffness: 150, damping: 20, mass: 0.8 }}
        >
          {/* Optional: Add a subtle glow or border around the spotlight */}
          <div className="w-full h-full rounded-xl border-2 border-brand-dark/50 shadow-[0_0_15px_rgba(217,119,6,0.5)]"></div>
        </motion.div>
      )}
    </div>
  );
}
