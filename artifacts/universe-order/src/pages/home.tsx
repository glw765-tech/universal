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
      <h1 className="font-serif text-3xl md:text-4xl text-foreground text-center leading-relaxed mb-8">
        What do you want from the universe?
      </h1>
      <textarea
        ref={textareaRef}
        value={intention}
        onChange={(e) => setIntention(e.target.value)}
        placeholder="Write your intention here…"
        className="w-full bg-white/5 border border-white/10 rounded-2xl text-center font-serif text-xl md:text-2xl outline-none resize-none placeholder:text-muted-foreground/30 text-foreground leading-relaxed p-6 focus:border-primary/30 focus:bg-white/8 transition-colors duration-300"
        rows={4}
      />
      <div className="h-24 mt-8 flex items-center justify-center">
        <AnimatePresence>
          {intention.trim().length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={handleSend}
              disabled={createOrder.isPending || createCheckout.isPending}
              className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium tracking-widest uppercase text-xs hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] cursor-pointer"
            >
              {createOrder.isPending || createCheckout.isPending ? "Sealing..." : `Seal & Send for $1`}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Explanation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1.2 }}
        className="mt-16 w-full max-w-sm flex flex-col items-center gap-6 text-center"
      >
        <p className="text-muted-foreground/60 text-xs uppercase tracking-[0.2em]">How it works</p>
        <div className="flex flex-col gap-5 w-full">
          {[
            { step: "01", label: "Write your intention", detail: "Name what you want. Be specific. The universe listens." },
            { step: "02", label: "Seal & send for $1", detail: "A small act of commitment. Your order enters the cosmos." },
            { step: "03", label: "Track your order", detail: "Follow it from Processing through In Transit to Delivered." },
            { step: "04", label: "Confirm delivery", detail: "When it arrives, mark it received and celebrate." },
          ].map(({ step, label, detail }) => (
            <div key={step} className="flex items-start gap-4 text-left">
              <span className="text-primary/40 font-mono text-xs pt-0.5 shrink-0">{step}</span>
              <div>
                <p className="text-foreground/70 text-sm font-medium">{label}</p>
                <p className="text-muted-foreground/50 text-xs mt-0.5 leading-relaxed">{detail}</p>
              </div>
            </div>
          ))}
        </div>
        <Link href="/history" className="mt-2 text-muted-foreground/40 hover:text-primary/60 text-xs tracking-widest uppercase transition-colors duration-300">
          View past orders
        </Link>
      </motion.div>
    </motion.div>
  );
}
