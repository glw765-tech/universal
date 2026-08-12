import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSessionToken, setActiveOrderId } from "@/lib/session";
import { useCreateOrder, useCreateOrderCheckout } from "@workspace/api-client-react";

export default function Home() {
  const sessionToken = getSessionToken();
  const [intention, setIntention] = useState("");
  const [showForm, setShowForm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      window.open(checkout.url, '_top');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-xl flex flex-col items-center gap-12">

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <p className="text-amber-400/60 text-xs tracking-[0.3em] uppercase">A manifestation practice</p>
        <h1 className="font-serif text-4xl md:text-5xl text-foreground leading-tight">
          Order from<br />the Universe
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
          Write your desire, seal it with intention, and let the universe work.
        </p>
      </motion.div>

      {/* Video */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(120,40,200,0.2)]"
      >
        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/EECpp3xELGg?rel=0&modestbranding=1"
          title="Order from the Universe"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </motion.div>

      {/* What you receive */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="w-full border border-white/10 rounded-2xl p-6 bg-white/[0.02] flex flex-col gap-4"
      >
        <h2 className="text-xs tracking-[0.25em] uppercase text-amber-400/60 text-center">What this is</h2>
        <p className="text-muted-foreground text-sm leading-relaxed text-center">
          Manifestation is the practice of clearly naming what you want, committing to it, and staying open to receiving it. This app gives that practice a beginning, a middle, and an end.
        </p>
        <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
          {[
            ["✦", "Your desire is written and sealed", "Naming it clearly is the first act of calling it in."],
            ["✦", "The Universe tracks your order", "Processing → In Transit → Delivered. You'll receive a notification at each stage."],
            ["✦", "You confirm when it arrives", "When what you asked for shows up — a feeling, an opportunity, the thing itself — you mark it delivered and receive your manifestation card."],
          ].map(([icon, title, body]) => (
            <div key={title} className="flex gap-3">
              <span className="text-amber-400/40 mt-0.5 shrink-0">{icon}</span>
              <div>
                <p className="text-foreground text-sm font-medium">{title}</p>
                <p className="text-muted-foreground text-xs leading-relaxed mt-0.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Order form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 1 }}
        className="w-full flex flex-col items-center gap-4"
      >
        <h2 className="font-serif text-2xl md:text-3xl text-foreground text-center">
          What do you wish to manifest?
        </h2>
        <textarea
          ref={textareaRef}
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          onFocus={() => setShowForm(true)}
          placeholder="Write your desire here"
          className="w-full bg-white/5 border border-white/10 rounded-2xl text-center font-serif text-xl md:text-2xl outline-none resize-none placeholder:text-muted-foreground/30 text-foreground leading-relaxed p-6 focus:border-primary/30 focus:bg-white/8 transition-colors duration-300"
          rows={3}
        />
        <p className="text-amber-400/50 text-sm text-center italic leading-relaxed max-w-sm">
          The act of placing this order is itself an act of faith — and that faith is what draws it to you.
        </p>

        <div className="h-16 flex items-center justify-center">
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
                {createOrder.isPending || createCheckout.isPending ? "Sealing..." : "Seal & Send for $1"}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Disclosures */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="w-full border border-white/5 rounded-xl p-5 bg-white/[0.015] flex flex-col gap-3"
      >
        <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground/50 text-center">Important disclosures</h3>
        <p className="text-muted-foreground/50 text-xs leading-relaxed text-center">
          <strong className="text-muted-foreground/70">No refunds.</strong> The $1 is a commitment fee that seals your intention. It is non-refundable. This is a spiritual practice, not a guaranteed outcome. Universal Order makes no promise that any specific result will occur in the physical world.
        </p>
        <p className="text-muted-foreground/50 text-xs leading-relaxed text-center">
          <strong className="text-muted-foreground/70">Entertainment & personal growth.</strong> This app is offered for entertainment, mindfulness, and personal development purposes only. Results vary. Your experience is your own.
        </p>
      </motion.div>

    </div>
  );
}
