import { useState } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { getSessionToken } from "@/lib/session";
import { useGetOrder, useConfirmOrderDelivery, getGetOrderQueryKey } from "@workspace/api-client-react";
import { Loader } from "@/components/loader";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";

const STAGES = [
  { title: "Order Received", number: 1 },
  { title: "Processed by the Universe", number: 2 },
  { title: "On Its Way to You", number: 3 },
  { title: "Awaiting Your Confirmation", number: 4 }
];

export default function OrderTracking() {
  const { id } = useParams();
  const sessionToken = getSessionToken();
  const orderId = id ? parseInt(id, 10) : 0;
  const queryClient = useQueryClient();
  
  const { data: order, isLoading } = useGetOrder(orderId, { 
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) } 
  });
  
  const confirmDelivery = useConfirmOrderDelivery();
  const [showCelebration, setShowCelebration] = useState(false);

  const handleConfirm = async () => {
    if (!order) return;
    try {
      await confirmDelivery.mutateAsync({ id: orderId, data: { sessionToken } });
      queryClient.setQueryData(getGetOrderQueryKey(orderId), { ...order, status: 'delivered', trackingStage: 4 });
      setShowCelebration(true);
    } catch(e) {
      console.error(e);
    }
  }

  if (isLoading) return <Loader />;

  if (!order) {
    return (
      <div className="text-center space-y-6">
        <p className="font-serif text-2xl text-foreground">Order not found</p>
        <Link href="/" className="text-primary hover:underline text-sm uppercase tracking-widest">Return Home</Link>
      </div>
    );
  }

  const isDelivered = order.status === "delivered";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md mx-auto flex flex-col pt-12 pb-24">
      <div className="flex flex-col space-y-0 w-full relative pl-4">
        {STAGES.map((stage, idx) => {
          const isPast = order.trackingStage > stage.number || (isDelivered && stage.number < 4);
          const isActive = (order.trackingStage === stage.number && !isDelivered) || (isDelivered && stage.number === 4);
          const isFuture = order.trackingStage < stage.number && !isDelivered;
          const isLast = idx === STAGES.length - 1;
          
          let displayTitle = stage.title;
          if (isLast && isDelivered) displayTitle = "Delivery Confirmed";

          return (
            <div key={idx} className={`relative flex items-start gap-8 min-h-[100px] ${isFuture ? 'opacity-30' : 'opacity-100'}`}>
              <div className="flex flex-col items-center h-full absolute left-0 top-1">
                <div className={`w-3 h-3 rounded-full z-10 transition-all duration-700 ${isActive ? 'bg-primary shadow-[0_0_15px_rgba(251,191,36,0.8)] scale-125' : isPast ? 'bg-primary/60' : 'border border-muted-foreground bg-background'}`} />
                {!isLast && (
                  <div className={`w-[1px] h-full absolute top-3 bottom-[-10px] transition-colors duration-700 ${isPast ? 'bg-primary/30' : 'bg-muted-foreground/20'}`} />
                )}
              </div>
              <div className="flex flex-col pb-10 pl-6">
                <h3 className={`text-xs tracking-widest uppercase transition-colors duration-700 ${isActive ? 'text-primary' : isPast ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                  {displayTitle}
                </h3>
                <AnimatePresence>
                  {isActive && order.motivationalMessage && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <p className="font-serif italic text-muted-foreground mt-3 text-lg leading-relaxed pr-4">
                        "{order.motivationalMessage}"
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {isLast && isDelivered && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-primary flex items-center gap-2">
                      <Check size={16} />
                      <span className="font-serif italic text-muted-foreground text-sm">The universe has provided.</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-8 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <p className="text-xs tracking-widest text-muted-foreground uppercase mb-6 relative z-10">Your Intention</p>
        <p className="font-serif text-xl md:text-2xl text-foreground relative z-10 leading-snug">"{order.intention}"</p>
      </div>

      <AnimatePresence>
        {order.status === "in_transit" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="mt-16 flex justify-center">
            <button 
              onClick={handleConfirm} 
              disabled={confirmDelivery.isPending} 
              className="px-10 py-4 rounded-full bg-primary text-primary-foreground font-medium tracking-widest uppercase text-xs hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(251,191,36,0.2)] disabled:opacity-50 cursor-pointer"
            >
              {confirmDelivery.isPending ? "Confirming..." : "I've Received This"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7, ease: "easeOut" }} className="max-w-lg flex flex-col items-center">
              <div className="w-16 h-16 mb-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                <Check size={32} />
              </div>
              <p className="font-serif text-3xl md:text-5xl text-primary mb-6">The Universe Delivers</p>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md mb-12">
                Your intention has been fulfilled. Keep this feeling of trust with you as you move forward.
              </p>
              <button 
                onClick={() => setShowCelebration(false)} 
                className="px-10 py-3 rounded-full border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-all uppercase tracking-widest text-xs cursor-pointer shadow-[0_0_10px_rgba(251,191,36,0.1)]"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
