import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Terms() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto py-12 space-y-10 text-sm leading-relaxed"
    >
      <div className="space-y-2">
        <p className="text-xs tracking-widest uppercase text-muted-foreground">Legal</p>
        <h1 className="font-serif text-3xl text-primary">Terms &amp; Refund Policy</h1>
        <p className="text-muted-foreground">Effective date: August 1, 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-foreground tracking-wide">What this app is</h2>
        <p className="text-muted-foreground">
          Order from the Universe is a manifestation and mindfulness tool. It provides a structured practice for setting intentions: you write a desire, commit to it with a $1 symbolic fee, and receive a personalised order that advances through cosmic stages as time passes. When you feel your desire has arrived in your life — as a feeling, an opportunity, or a tangible outcome — you confirm it and receive a manifestation card.
        </p>
        <p className="text-muted-foreground">
          This app is offered for <strong className="text-foreground/80">entertainment, personal development, and mindfulness purposes only.</strong> It is a spiritual practice tool, not a service that delivers physical goods or guarantees any real-world result. Results are entirely personal and will vary from person to person.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-foreground tracking-wide">The $1 commitment fee</h2>
        <p className="text-muted-foreground">
          The $1 you pay when placing an order is a <strong className="text-foreground/80">symbolic commitment fee</strong> — an act of faith that seals your intention. It covers the cost of operating the platform and represents your personal commitment to the manifestation practice.
        </p>
        <p className="text-muted-foreground">
          By completing payment you acknowledge that this fee is for access to this experience, not for the delivery of any physical product or guaranteed outcome.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-foreground tracking-wide">No refunds</h2>
        <p className="text-muted-foreground">
          <strong className="text-foreground/80">All sales are final. The $1 commitment fee is non-refundable.</strong> Because the act of placing the order — setting the intention and making the commitment — is itself the service, it cannot be reversed or undone. No refunds will be issued for any reason.
        </p>
        <p className="text-muted-foreground">
          If you have a concern about an unauthorised charge, please contact us at{" "}
          <a href="mailto:glw765@ymail.com" className="text-primary/70 hover:text-primary underline underline-offset-2 transition-colors">
            glw765@ymail.com
          </a>{" "}
          and we will work with you directly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-foreground tracking-wide">No guarantees</h2>
        <p className="text-muted-foreground">
          Order from the Universe makes no guarantee, warranty, or representation that any specific result will occur in the physical world as a consequence of using this app. The practice of manifestation is a personal, spiritual exercise. We are not liable for any expectation of outcome.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-foreground tracking-wide">User conduct</h2>
        <p className="text-muted-foreground">
          You agree to use this app for lawful, personal purposes only. You must be at least 18 years old to make a purchase. By placing an order you confirm that you have read and agree to these terms.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-foreground tracking-wide">Contact</h2>
        <p className="text-muted-foreground">
          Questions about these terms?{" "}
          <a href="mailto:glw765@ymail.com" className="text-primary/70 hover:text-primary underline underline-offset-2 transition-colors">
            glw765@ymail.com
          </a>
        </p>
      </section>

      <div className="pt-4 border-t border-primary/10 flex gap-6">
        <Link href="/" className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">
          ← Return
        </Link>
        <Link href="/privacy" className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors">
          Privacy Policy
        </Link>
      </div>
    </motion.div>
  );
}
