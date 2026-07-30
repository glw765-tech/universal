import { motion } from 'framer-motion';

export function PersistentBackground({ currentScene }: { currentScene: number }) {
  // We can vary the scale/position of the background or overlays based on the scene
  // For instance, when scene > 2, zoom in slightly
  
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <motion.video
        src={`${import.meta.env.BASE_URL}videos/nebula_loop.mp4`}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        animate={{
          scale: currentScene >= 3 ? 1.1 : 1.05,
          filter: currentScene === 4 ? 'brightness(1.2) contrast(1.1)' : 'brightness(0.8) contrast(1.0)'
        }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />
      
      {/* Dark overlay to ensure text is readable */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-dark)] via-transparent to-[var(--color-bg-dark)] opacity-80"
      />
      
      {/* Dynamic light bursts that change per scene */}
      <motion.div
        className="absolute w-[80vw] h-[80vw] rounded-full blur-[120px] mix-blend-screen"
        style={{ background: 'radial-gradient(circle, rgba(138,43,226,0.3) 0%, rgba(0,0,0,0) 70%)' }}
        animate={{
          x: currentScene % 2 === 0 ? '-10vw' : '30vw',
          y: currentScene % 2 === 0 ? '10vh' : '-20vh',
          scale: currentScene === 1 ? 1.5 : 1
        }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[60vw] h-[60vw] rounded-full blur-[100px] mix-blend-screen"
        style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, rgba(0,0,0,0) 70%)' }}
        animate={{
          x: currentScene % 2 === 0 ? '40vw' : '-20vw',
          y: currentScene % 2 === 0 ? '-10vh' : '30vh',
          scale: currentScene === 3 ? 1.8 : 1
        }}
        transition={{ duration: 5, ease: 'easeInOut' }}
      />
    </div>
  );
}
