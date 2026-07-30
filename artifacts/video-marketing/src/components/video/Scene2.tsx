import { motion } from 'framer-motion';

export function Scene2() {
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="relative flex flex-col items-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src={`${import.meta.env.BASE_URL}images/gold_seal.png`}
          alt="Gold Seal"
          className="w-40 h-40 object-contain mb-3 drop-shadow-[0_0_40px_rgba(255,215,0,0.6)]"
          initial={{ scale: 3, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 100, damping: 20 }}
        />
        
        <motion.h2 
          className="font-display text-6xl md:text-8xl text-gradient-gold text-center leading-tight tracking-wide mb-3"
          initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ delay: 1.2, duration: 1.0 }}
        >
          Seal it, Send it.
        </motion.h2>

        <motion.div
          className="px-12 py-4 rounded-full bg-[var(--color-bg-light)] border border-[var(--color-accent)] glow-gold relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 2.8, type: 'spring', stiffness: 200, damping: 25 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,215,0,0.2)] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          <span className="font-display text-3xl tracking-widest text-[var(--color-accent)] uppercase">
            Commit for $1
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
