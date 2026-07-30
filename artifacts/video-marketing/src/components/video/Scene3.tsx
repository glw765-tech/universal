import { motion } from 'framer-motion';

export function Scene3() {
  const stages = ["Processing", "In Transit", "Delivered"];
  
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.2, filter: 'blur(15px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h2 
        className="font-body font-light text-4xl md:text-6xl text-[var(--color-text-secondary)] tracking-widest uppercase mb-20 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.2 }}
      >
        Track the cosmic journey
      </motion.h2>

      <div className="relative w-full max-w-5xl flex justify-between items-center px-10">
        {/* Background track line */}
        <div className="absolute left-10 right-10 top-1/2 h-[2px] bg-[rgba(138,43,226,0.3)] -translate-y-1/2" />
        
        {/* Animated fill line */}
        <motion.div 
          className="absolute left-10 top-1/2 h-[2px] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] -translate-y-1/2 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.5, duration: 3.5, ease: "easeInOut" }}
          style={{ width: "calc(100% - 80px)" }}
        />

        {stages.map((stage, i) => (
          <div key={stage} className="relative flex flex-col items-center z-10">
            {/* The Node */}
            <motion.div 
              className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-[var(--color-bg-dark)] border-2 border-[var(--color-secondary)] flex items-center justify-center relative"
              initial={{ scale: 0, borderColor: "var(--color-secondary)" }}
              animate={{ 
                scale: 1, 
                borderColor: ["var(--color-secondary)", "var(--color-accent)"]
              }}
              transition={{ 
                scale: { delay: 1.0 + i * 0.2, type: "spring", stiffness: 200, damping: 20 },
                borderColor: { delay: 1.5 + i * 1.5, duration: 0.5 }
              }}
            >
              {/* Active glow */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-[var(--color-accent)] glow-gold"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.8] }}
                transition={{ delay: 1.5 + i * 1.5, duration: 0.8 }}
              />
              <motion.div 
                className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[var(--color-text-primary)] relative z-10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5 + i * 1.5, type: "spring" }}
              />
            </motion.div>
            
            {/* The Label */}
            <motion.div 
              className="absolute top-16 text-center w-40"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: [0, 1], y: 0 }}
              transition={{ delay: 1.7 + i * 1.5, duration: 0.8 }}
            >
              <span className="font-display text-2xl md:text-3xl text-[var(--color-text-primary)]">
                {stage}
              </span>
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
