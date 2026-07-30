import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getSessionToken, setSessionToken } from "@/lib/session";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = "email" | "code" | "done";

export default function LinkOrdersModal({ open, onClose }: Props) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

  const reset = () => {
    setStep("email");
    setEmail("");
    setCode("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const requestCode = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/auth/request-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send code");
      setStep("code");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, sessionToken: getSessionToken() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid code");
      setSessionToken(data.sessionToken);
      await queryClient.invalidateQueries();
      setStep("done");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25 }}
            className="relative bg-[#0d0d1a] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {step === "email" && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="font-serif text-xl text-foreground mb-2">Link your orders</h2>
                  <p className="text-muted-foreground/60 text-sm leading-relaxed">
                    Enter your email and we'll send a code. Use it on any device to access your orders.
                  </p>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && email && requestCode()}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/30 transition-colors duration-200 text-sm"
                />
                {error && <p className="text-red-400/80 text-xs">{error}</p>}
                <button
                  onClick={requestCode}
                  disabled={!email || loading}
                  className="w-full py-3 rounded-full bg-primary text-primary-foreground font-medium tracking-widest uppercase text-xs hover:scale-105 transition-transform duration-200 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
                >
                  {loading ? "Sending…" : "Send Code"}
                </button>
              </div>
            )}

            {step === "code" && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="font-serif text-xl text-foreground mb-2">Enter your code</h2>
                  <p className="text-muted-foreground/60 text-sm leading-relaxed">
                    We sent a 6-digit code to <span className="text-foreground/70">{email}</span>.
                  </p>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => e.key === "Enter" && code.length === 6 && verifyCode()}
                  placeholder="000000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-primary/30 transition-colors duration-200 text-center font-mono text-2xl tracking-[0.5em]"
                />
                {error && <p className="text-red-400/80 text-xs">{error}</p>}
                <button
                  onClick={verifyCode}
                  disabled={code.length !== 6 || loading}
                  className="w-full py-3 rounded-full bg-primary text-primary-foreground font-medium tracking-widest uppercase text-xs hover:scale-105 transition-transform duration-200 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
                >
                  {loading ? "Verifying…" : "Verify"}
                </button>
                <button onClick={() => { setStep("email"); setError(null); }} className="text-muted-foreground/40 text-xs hover:text-muted-foreground/70 transition-colors duration-200">
                  Use a different email
                </button>
              </div>
            )}

            {step === "done" && (
              <div className="flex flex-col gap-5 items-center text-center">
                <div className="text-4xl">✦</div>
                <div>
                  <h2 className="font-serif text-xl text-foreground mb-2">Orders linked</h2>
                  <p className="text-muted-foreground/60 text-sm leading-relaxed">
                    Your orders are now connected to <span className="text-foreground/70">{email}</span>. Use the same email on any device to restore them.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-full bg-primary text-primary-foreground font-medium tracking-widest uppercase text-xs hover:scale-105 transition-transform duration-200 cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
