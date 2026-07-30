import { useGetOrderHistory } from "@workspace/api-client-react";
import { getSessionToken } from "@/lib/session";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Loader } from "@/components/loader";

export default function History() {
  const sessionToken = getSessionToken();
  const { data: orders, isLoading } = useGetOrderHistory(
    { sessionToken },
    { query: { enabled: !!sessionToken } }
  );

  if (isLoading) return <Loader />;

  return (
    <div className="w-full flex flex-col items-center max-w-xl mx-auto py-12">
      <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">Manifested</h1>
      <p className="text-muted-foreground/50 text-sm text-center mb-12 max-w-sm leading-relaxed">These orders have been fulfilled — they are your current reality.</p>
      
      {!orders || orders.length === 0 ? (
        <p className="text-center text-muted-foreground font-serif italic text-lg">You have no completed orders yet.</p>
      ) : (
        <div className="space-y-6 w-full">
          {orders.map((order, i) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={order.id}>
              <Link href={`/order/${order.id}`} className="block p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-colors relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <p className="font-serif text-xl mb-6 text-foreground line-clamp-2 relative z-10 leading-snug">"{order.intention}"</p>
                <div className="flex justify-between items-center text-[10px] tracking-widest uppercase text-muted-foreground relative z-10 border-t border-white/5 pt-4">
                  <span>{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className={order.status === 'delivered' ? 'text-primary' : ''}>
                    {order.status === 'delivered' ? 'Fulfilled' : order.status.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
