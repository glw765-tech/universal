import { useGetCurrentOrders } from "@workspace/api-client-react";
import { getSessionToken } from "@/lib/session";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Loader } from "@/components/loader";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Awaiting Payment",
  processing: "Processing",
  in_transit: "In Transit",
};

export default function CurrentOrders() {
  const sessionToken = getSessionToken();
  const { data: orders, isLoading } = useGetCurrentOrders(
    { sessionToken },
    { query: { enabled: !!sessionToken } }
  );

  if (isLoading) return <Loader />;

  return (
    <div className="w-full flex flex-col items-center max-w-xl mx-auto py-12">
      <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-12">Current Orders</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center space-y-4">
          <p className="text-muted-foreground font-serif italic text-lg">No orders in progress.</p>
          <Link href="/" className="inline-block mt-4 px-8 py-3 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 uppercase tracking-widest text-xs shadow-[0_0_10px_rgba(251,191,36,0.1)] hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            Place an Order
          </Link>
        </div>
      ) : (
        <div className="space-y-6 w-full">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/order/${order.id}`}
                className="block p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-colors relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <p className="font-serif text-xl mb-6 text-foreground line-clamp-2 relative z-10 leading-snug">
                  "{order.intention}"
                </p>
                <div className="flex justify-between items-center text-[10px] tracking-widest uppercase text-muted-foreground relative z-10 border-t border-white/5 pt-4">
                  <span>{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="text-primary/70">{STATUS_LABEL[order.status] ?? order.status}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
