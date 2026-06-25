/**
 * WellnessCard — unified dark glass card
 * Uses inline styles so it never breaks regardless of Tailwind config
 */
import { motion } from 'framer-motion';

export default function WellnessCard({
  children, className = '', delay = 0,
  animate = true, onClick, style = {},
}) {
  const base = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
    padding: 20,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  };

  const content = (
    <div
      className={className}
      style={base}
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.18)';
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
      }}
    >
      {/* Corner glow */}
      <div aria-hidden style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: 'rgba(99,102,241,0.10)', filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      {content}
    </motion.div>
  );
}