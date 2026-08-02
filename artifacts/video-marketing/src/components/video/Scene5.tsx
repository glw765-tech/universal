import { motion } from 'framer-motion';

export function Scene5() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 p-10 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
    >
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div 
          className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-[var(--color-accent)] flex items-center justify-center mb-8 relative"
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ delay: 1.0, duration: 2, ease: "easeOut" }}
        >
          <div className="absolute inset-0 rounded-full glow-gold opacity-50" />
          <svg className="w-10 h-10 text-[var(--color-accent)] relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
          </svg>
        </motion.div>

        <motion.h1 
          className="font-display text-6xl md:text-8xl text-gradient-gold text-center leading-tight tracking-wide mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1.2 }}
        >
          Universal<br />Order
        </motion.h1>

        <motion.p
          className="font-body font-light text-4xl md:text-6xl text-[var(--color-text-primary)] text-center tracking-widest mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1.5 }}
        >
          What will you ask for?
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
