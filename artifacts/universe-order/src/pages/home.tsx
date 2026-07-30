import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { getSessionToken, setActiveOrderId } from "@/lib/session";
import { useCreateOrder, useCreateOrderCheckout, useGetActiveOrder, useGetOrderProduct, getGetActiveOrderQueryKey } from "@workspace/api-client-react";
import { Loader } from "@/components/loader";
import { useQueryClient } from "@tanstack/react-query";

export default function Home() {
  const sessionToken = getSessionToken();
  const [intention, setIntention] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  const { data: activeOrderData, isLoading: isActiveLoading } = useGetActiveOrder(
    { sessionToken },
    { query: { enabled: !!sessionToken, queryKey: getGetActiveOrderQueryKey({ sessionToken }) } }
  );

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
      
      queryClient.invalidateQueries({ queryKey: getGetActiveOrderQueryKey({ sessionToken }) });
      
      const checkout = await createCheckout.mutateAsync({
        id: order.id,
        data: { sessionToken }
      });

      window.location.href = checkout.url;
    } catch (e) {
      console.error(e);
    }
  };

  if (isActiveLoading) return <Loader />;

  const activeOrder = activeOrderData?.order;

  if (activeOrder && activeOrder.status !== "delivered") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center space-y-8">
        <p className="font-serif text-2xl md:text-3xl text-foreground text-balance">
          You have a request in motion.
        </p>
        <p className="text-muted-foreground text-sm tracking-wide">
          The universe is working. Wait for it to unfold before asking anew.
        </p>
        <Link href={`/order/${activeOrder.id}`} className="mt-4 px-8 py-3 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 uppercase tracking-widest text-xs shadow-[0_0_10px_rgba(251,191,36,0.1)] hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]">
          View Your Order
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="w-full max-w-xl flex flex-col items-center">
      <textarea
        ref={textareaRef}
        value={intention}
        onChange={(e) => setIntention(e.target.value)}
        placeholder="What do you want from the universe?"
        className="w-full bg-transparent text-center font-serif text-3xl md:text-4xl outline-none resize-none placeholder:text-muted-foreground/30 text-foreground leading-relaxed"
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
    </motion.div>
  );
}
