import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSessionToken, setActiveOrderId } from "@/lib/session";
import { useCreateOrder, useCreateOrderCheckout, useGetOrderProduct } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function Home() {
  const sessionToken = getSessionToken();
  const [intention, setIntention] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: product } = useGetOrderProduct();
  const createOrder = useCreateOrder();
  const createCheckout = useCreateOrderCheckout();

  const handleSend = async () => {
    if (!intention.trim()) return;

    try {
      const order = await createOrder.mutateAsync({
        data: { intention, sessionToken }
      });
      setActiveOrderId(order.id);

      const checkout = await createCheckout.mutateAsync({
        id: order.id,
        data: { sessionToken }
      });

      window.location.href = checkout.url;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="w-full max-w-xl flex flex-col items-center">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
        className="text-primary/50 text-base text-center leading-relaxed mb-8 max-w-sm"
      >
        Write your desire, seal it with $1, and send it into the cosmos. The universe will receive it, process it, and deliver it to you.
      </motion.p>
      <h1 className="font-serif text-3xl md:text-4xl text-foreground text-center leading-relaxed mb-8">
        What do you want from the universe?
      </h1>
      <textarea
        ref={textareaRef}
        value={intention}
        onChange={(e) => setIntention(e.target.value)}
        placeholder="Write your desire here"
        className="w-full bg-white/5 border border-white/10 rounded-2xl text-center font-serif text-xl md:text-2xl outline-none resize-none placeholder:text-muted-foreground/30 text-foreground leading-relaxed p-6 focus:border-primary/30 focus:bg-white/8 transition-colors duration-300"
        rows={4}
      />
      <div className="h-16 mt-6 flex items-center justify-center">
        <AnimatePresence>
          {intention.trim().length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={handleSend}
              disabled={createOrder.isPending || createCheckout.isPending}
              className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium tracking-widest uppercase text-xs hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(160,80,255,0.3)] hover:shadow-[0_0_30px_rgba(160,80,255,0.5)] cursor-pointer"
            >
              {createOrder.isPending || createCheckout.isPending ? "Sealing..." : `Seal & Send for $1`}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
