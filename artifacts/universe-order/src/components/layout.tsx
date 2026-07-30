import { ReactNode } from "react";
import { Link } from "wouter";
import { Stars } from "./stars";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground relative overflow-hidden flex flex-col font-sans">
      {/* Deep cosmic gradients */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,_rgba(59,7,100,0.15)_0%,_transparent_60%)]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_100%,_rgba(15,23,42,1)_0%,_rgba(2,6,23,1)_100%)] -z-10" />
      
      {/* Subtle texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      
      {/* Particles */}
      <Stars />
      
      <header className="relative z-10 w-full p-6 flex justify-between items-center text-xs tracking-widest uppercase text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors duration-500 cursor-pointer">
          Universe
        </Link>
        <Link href="/history" className="hover:text-primary transition-colors duration-500 cursor-pointer">
          Past Orders
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto">
        {children}
      </main>
    </div>
  );
}
