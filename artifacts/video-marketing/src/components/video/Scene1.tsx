import { motion } from 'framer-motion';

export function Scene1() {
  const desireText = "I attract boundless creativity and clarity.";
  
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center z-10 p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h2 
        className="font-display text-7xl md:text-8xl lg:text-9xl text-[var(--color-text-secondary)] mb-8 tracking-widest uppercase text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.2 }}
      >
        Submit your order to the universe
      </motion.h2>

      <p className="font-display text-6xl md:text-8xl leading-relaxed text-[var(--color-text-primary)] text-center text-gradient-gold max-w-4xl">
        {desireText.split('').map((char, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ delay: 1.5 + index * 0.05, duration: 0.8 }}
          >
            {char}
          </motion.span>
        ))}
      </p>

      <motion.p
        className="font-body font-light text-2xl md:text-4xl text-[var(--color-text-secondary)] italic text-center max-w-3xl mt-10 leading-relaxed px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 + desireText.length * 0.05 + 0.8, duration: 1.4 }}
      >
        The act of placing this order is itself an act of faith — and that faith is what draws it to you.
      </motion.p>
    </motion.div>
  );
}
