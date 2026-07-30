import { motion } from "framer-motion";

export function Loader() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(251,191,36,0.8)]"
      />
    </div>
  );
}
