import { ReactNode, useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Stars } from "./stars";
import LinkOrdersModal from "./link-orders-modal";

export function Layout({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground relative overflow-hidden flex flex-col font-sans">
      {/* Deep cosmic gradients */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,_rgba(120,40,200,0.25)_0%,_transparent_60%)]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_100%,_rgba(30,8,50,1)_0%,_rgba(8,3,18,1)_100%)] -z-10" />
      
      {/* Subtle texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      
      {/* Particles */}
      <Stars />
      
      <header className="relative z-50 w-full p-6 flex justify-between items-center text-xs tracking-widest uppercase text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors duration-500 cursor-pointer">
          Universal Order
        </Link>

        {/* Orders dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className={`flex items-center gap-2 hover:text-primary transition-colors duration-300 cursor-pointer ${dropdownOpen ? "text-primary" : ""}`}
          >
            Orders
            <svg
              className={`w-2.5 h-2.5 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
              viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"
            >
              <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dropdown panel */}
          <div
            className={`absolute right-0 mt-3 w-44 z-50 transition-all duration-200 origin-top-right ${
              dropdownOpen
                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
            }`}
          >
            <div className="bg-[#0e0718] border border-primary/20 rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(120,40,200,0.25)]">
              <Link
                href="/current"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-3 hover:bg-primary/10 hover:text-primary transition-colors duration-200 flex items-center gap-3"
              >
                <span className="text-primary/40">✦</span> Track
              </Link>
              <div className="border-t border-primary/10" />
              <Link
                href="/history"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-3 hover:bg-primary/10 hover:text-primary transition-colors duration-200 flex items-center gap-3"
              >
                <span className="text-primary/40">✦</span> History
              </Link>
              <div className="border-t border-primary/10" />
              <button
                onClick={() => { setModalOpen(true); setDropdownOpen(false); }}
                className="w-full text-left px-4 py-3 hover:bg-primary/10 hover:text-primary transition-colors duration-200 flex items-center gap-3"
              >
                <span className="text-primary/40">✦</span> Link
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto">
        {children}
      </main>

      <footer className="relative z-10 w-full p-6 flex justify-center gap-8">
        <Link href="/privacy" className="text-xs tracking-widest uppercase text-muted-foreground/40 hover:text-muted-foreground transition-colors duration-300">
          Privacy
        </Link>
        <Link href="/terms" className="text-xs tracking-widest uppercase text-muted-foreground/40 hover:text-muted-foreground transition-colors duration-300">
          Terms &amp; Refunds
        </Link>
      </footer>

      <LinkOrdersModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
