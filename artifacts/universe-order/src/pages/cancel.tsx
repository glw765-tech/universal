import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Cancel() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center space-y-8 py-20">
      <p className="font-serif text-3xl text-foreground">The moment wasn't right.</p>
      <p className="text-muted-foreground text-sm tracking-wide leading-relaxed max-w-sm">
        Your intention is saved in your heart. You can always try again when you are ready to let it go.
      </p>
      <Link href="/" className="mt-8 px-8 py-3 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 uppercase tracking-widest text-xs">
        Return Home
      </Link>
    </motion.div>
  );
}
