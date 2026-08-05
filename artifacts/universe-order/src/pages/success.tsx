import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Success() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const orderId = searchParams.get("orderId");
    
    if (orderId) {
      const timer = setTimeout(() => setLocation(`/order/${orderId}`), 3500);
      return () => clearTimeout(timer);
    }
    setLocation("/");
    return undefined;
  }, [setLocation]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="flex flex-col items-center justify-center text-center py-20">
      <div className="w-1 h-1 rounded-full bg-primary mb-8 animate-ping shadow-[0_0_20px_rgba(251,191,36,1)]" />
      <p className="font-serif text-2xl md:text-3xl text-foreground font-light tracking-wide animate-pulse">
        Your message is travelling...
      </p>
      <p className="text-muted-foreground mt-4 text-xs tracking-widest uppercase">
        The universe is listening
      </p>
    </motion.div>
  );
}
