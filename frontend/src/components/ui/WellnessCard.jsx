import { motion } from 'framer-motion';

/**
 * WellnessCard
 *
 * Props:
 *  - children     — card content
 *  - className    — extra Tailwind classes
 *  - variant      — 'default' | 'dark' | 'subtle'
 *  - hover        — true (default) | false — enables lift + shadow on hover
 *  - animate      — true (default) | false — fade-up entry animation
 *  - delay        — stagger delay in seconds (default 0)
 *  - onClick      — optional click handler
 *  - as           — element/component to render as (default 'div')
 */
export default function WellnessCard({
  children,
  className = '',
  variant = 'default',
  hover = true,
  animate = true,
  delay = 0,
  onClick,
  as: Tag = 'div',
}) {
  const base =
    'relative overflow-hidden rounded-[28px] p-6 backdrop-blur-xl transition-all duration-300';

  const variants = {
    default:
      'border border-slate-200/60 bg-white/80 shadow-md dark:border-white/[0.08] dark:bg-white/[0.04]',
    dark:
      'border border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white shadow-xl',
    subtle:
      'border border-slate-100 bg-slate-50/80 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02]',
  };

  const hoverStyles = hover
    ? 'hover:-translate-y-1 hover:border-indigo-300/40 hover:shadow-[0_16px_48px_rgba(99,102,241,0.18)] dark:hover:border-indigo-500/30 cursor-default'
    : '';

  const clickableStyles = onClick
    ? 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
    : '';

  const combined = `${base} ${variants[variant] ?? variants.default} ${hoverStyles} ${clickableStyles} ${className}`;

  const content = (
    <Tag
      className={combined}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick(e)
          : undefined
      }
    >
      {/* Decorative corner glow — non-intrusive in all variants */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-indigo-400/10 blur-2xl"
      />

      <div className="relative z-10">{children}</div>
    </Tag>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: 'easeOut' }}
    >
      {content}
    </motion.div>
  );
}