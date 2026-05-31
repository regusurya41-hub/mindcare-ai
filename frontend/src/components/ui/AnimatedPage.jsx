import { motion, useReducedMotion } from 'framer-motion';

// ─── Animation presets ───────────────────────────────────────────────────────

const VARIANTS = {
  /** Default: subtle vertical fade-up */
  fadeUp: {
    initial:  { opacity: 0, y: 20 },
    animate:  { opacity: 1, y: 0  },
    exit:     { opacity: 0, y: -14 },
  },
  /** Horizontal slide — good for drill-down / sub-page transitions */
  slideLeft: {
    initial:  { opacity: 0, x: 32  },
    animate:  { opacity: 1, x: 0   },
    exit:     { opacity: 0, x: -32 },
  },
  slideRight: {
    initial:  { opacity: 0, x: -32 },
    animate:  { opacity: 1, x: 0   },
    exit:     { opacity: 0, x: 32  },
  },
  /** Pure fade — safest fallback, respects reduced-motion */
  fade: {
    initial:  { opacity: 0 },
    animate:  { opacity: 1 },
    exit:     { opacity: 0 },
  },
  /** Scale-up — works well for modal-like pages */
  scaleUp: {
    initial:  { opacity: 0, scale: 0.97 },
    animate:  { opacity: 1, scale: 1    },
    exit:     { opacity: 0, scale: 0.97 },
  },
};

/** Stagger container — children animate in sequence when stagger=true */
const STAGGER_CONTAINER = {
  animate: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const STAGGER_CHILD = {
  initial:  { opacity: 0, y: 14 },
  animate:  { opacity: 1, y: 0  },
  exit:     { opacity: 0, y: -8 },
};

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * AnimatedPage
 *
 * Props:
 *  - children   — page content
 *  - className  — extra Tailwind / CSS classes
 *  - variant    — 'fadeUp' | 'slideLeft' | 'slideRight' | 'fade' | 'scaleUp'
 *  - duration   — transition duration in seconds (default 0.38)
 *  - delay      — entry delay in seconds (default 0)
 *  - stagger    — if true, wraps children in a stagger container so each
 *                 direct child fades up in sequence (default false)
 *  - ease       — Framer Motion easing string or array (default 'easeOut')
 */
export default function AnimatedPage({
  children,
  className = '',
  variant = 'fadeUp',
  duration = 0.38,
  delay = 0,
  stagger = false,
  ease = 'easeOut',
}) {
  const prefersReduced = useReducedMotion();

  // If the user prefers reduced motion, collapse to a plain fade
  const chosen = prefersReduced ? VARIANTS.fade : (VARIANTS[variant] ?? VARIANTS.fadeUp);

  const transition = {
    duration: prefersReduced ? 0.15 : duration,
    delay,
    ease,
  };

  // ── Stagger mode ──────────────────────────────────────────────────────────
  if (stagger) {
    return (
      <motion.div
        variants={STAGGER_CONTAINER}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
      >
        {Array.isArray(children)
          ? children.map((child, i) => (
              <motion.div
                key={i}
                variants={prefersReduced ? VARIANTS.fade : STAGGER_CHILD}
                transition={transition}
              >
                {child}
              </motion.div>
            ))
          : // Single child — still gets the stagger-child variant
            <motion.div variants={prefersReduced ? VARIANTS.fade : STAGGER_CHILD} transition={transition}>
              {children}
            </motion.div>
        }
      </motion.div>
    );
  }

  // ── Standard mode ─────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={chosen.initial}
      animate={chosen.animate}
      exit={chosen.exit}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Named exports for advanced use ─────────────────────────────────────────

/** Pre-bound variants so callers can build custom motion elements consistently */
export { VARIANTS, STAGGER_CHILD, STAGGER_CONTAINER };