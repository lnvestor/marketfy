import { motion } from 'framer-motion';

export type StepStatus = 'done' | 'current' | 'failed';

interface StepIndicatorProps {
  status?: StepStatus;
}

const statusStyles = {
  done: {
    dot: 'bg-white/70',
    glow: 'from-white/30 via-white/20',
    border: 'border-white/20',
    shadow: 'shadow-[0_0_10px_rgba(255,255,255,0.2)]'
  },
  current: {
    dot: 'bg-white/90',
    glow: 'from-white/40 via-white/25',
    border: 'border-white/30',
    shadow: 'shadow-[0_0_10px_rgba(255,255,255,0.3)]'
  },
  failed: {
    dot: 'bg-white/50',
    glow: 'from-white/20 via-white/15',
    border: 'border-white/10',
    shadow: 'shadow-[0_0_10px_rgba(255,255,255,0.1)]'
  }
};

export function StepIndicator({ status = 'current' }: StepIndicatorProps) {
  const styles = statusStyles[status];

  return (
    <motion.div 
      className="relative w-6 h-6 shrink-0"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.div 
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${styles.glow} to-transparent blur-md`}
        animate={{ 
          opacity: [0.4, 0.6, 0.4],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <div className={`relative h-full w-full rounded-full bg-black/50 ${styles.border} border backdrop-blur-sm flex items-center justify-center shadow-lg`}>
        <motion.div 
          className={`h-2 w-2 rounded-full ${styles.dot} ${styles.shadow}`}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
}
