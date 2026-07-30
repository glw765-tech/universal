import { motion } from 'framer-motion';

export function Scene4() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h2 
        className="font-body font-light text-4xl md:text-5xl text-[var(--color-text-secondary)] tracking-widest uppercase mb-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.2 }}
      >
        Until the moment it
      </motion.h2>

      <motion.h1 
        className="font-display text-6xl md:text-8xl text-gradient-gold text-center leading-tight tracking-wide mb-16"
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
      >
        Manifests.
      </motion.h1>

      <motion.div
        className="relative"
        initial={{ y: 100, opacity: 0, rotateX: 45, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, rotateX: 0, scale: 1 }}
        transition={{ delay: 2.2, duration: 2.0, type: "spring", stiffness: 50, damping: 20 }}
        style={{ perspective: 1000 }}
      >
        {/* Glow behind the card */}
        <motion.div 
          className="absolute inset-0 bg-[var(--color-primary)] rounded-full blur-[80px] opacity-0"
          animate={{ opacity: 0.5, scale: [1, 1.2, 1] }}
          transition={{ delay: 3.0, duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.img
          src={`${import.meta.env.BASE_URL}images/manifest_card.png`}
          alt="Manifestation Card"
          className="w-full max-w-md object-contain drop-shadow-[0_20px_50px_rgba(255,215,0,0.3)] relative z-10"
          animate={{ y: [0, -15, 0] }}
          transition={{ delay: 4.2, duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}
