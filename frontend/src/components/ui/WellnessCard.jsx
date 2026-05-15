import { motion } from 'framer-motion';

export default function WellnessCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.32, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className={`panel transition-shadow hover:shadow-glow ${className}`}
    >
      {children}
    </motion.div>
  );
}
