import { Link } from "wouter";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center space-y-6 py-20">
      <p className="font-serif text-3xl text-primary">Void</p>
      <p className="text-muted-foreground max-w-md">You've drifted too far. There is nothing here.</p>
      <Link href="/" className="px-8 py-3 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all mt-4 inline-block tracking-widest uppercase text-xs">
        Return
      </Link>
    </motion.div>
  );
}
