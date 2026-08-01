import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto py-12 space-y-10 text-sm leading-relaxed"
    >
      <div className="space-y-2">
        <p className="text-xs tracking-widest uppercase text-muted-foreground">Legal</p>
        <h1 className="font-serif text-3xl text-primary">Privacy Policy</h1>
        <p className="text-muted-foreground">Effective date: August 1, 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-foreground tracking-wide">Overview</h2>
        <p className="text-muted-foreground">
          Order from the Universe ("we", "our", or "the app") is a manifestation tool that lets you
          set an intention and receive a symbolic confirmation. This policy explains what information
          we collect, why we collect it, and how it is handled.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-foreground tracking-wide">Information We Collect</h2>
        <ul className="space-y-2 text-muted-foreground list-none">
          <li className="flex gap-3">
            <span className="text-primary/50 shrink-0">✦</span>
            <span>
              <strong className="text-foreground/80">Desire text.</strong> The intention or wish you
              type when placing an order. This is stored so we can display your order back to you and
              track its cosmic progress.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary/50 shrink-0">✦</span>
            <span>
              <strong className="text-foreground/80">Session identifiers.</strong> A randomly
              generated token stored in your browser or device to associate your orders with your
              session. No account or login is required.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary/50 shrink-0">✦</span>
            <span>
              <strong className="text-foreground/80">Payment information.</strong> If you choose to
              pay for an order, payment is processed by Stripe. We never see or store your card
              number. We receive only a confirmation that payment succeeded and the Stripe payment
              intent ID.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary/50 shrink-0">✦</span>
            <span>
              <strong className="text-foreground/80">Device push token (mobile only).</strong> If
              you allow notifications on the mobile app, we store a device push token to send you
              updates when your order advances. You can revoke this at any time through your device
              settings.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary/50 shrink-0">✦</span>
            <span>
              <strong className="text-foreground/80">Email address (optional).</strong> If you
              choose to link your orders to an email address, we store that address solely to let
              you retrieve your orders across devices. We do not send marketing email.
            </span>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-foreground tracking-wide">How We Use It</h2>
        <p className="text-muted-foreground">
          All data collected is used only to operate the app: to display your orders, send
          order-status notifications, and process payments. We do not sell, rent, or share your
          data with third parties for advertising or analytics purposes.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-foreground tracking-wide">Third-Party Services</h2>
        <ul className="space-y-2 text-muted-foreground list-none">
          <li className="flex gap-3">
            <span className="text-primary/50 shrink-0">✦</span>
            <span>
              <strong className="text-foreground/80">Stripe</strong> — payment processing. Stripe's
              privacy policy is available at{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
              >
                stripe.com/privacy
              </a>
              .
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary/50 shrink-0">✦</span>
            <span>
              <strong className="text-foreground/80">Expo / Apple Push Notification Service</strong>{" "}
              — used to deliver order-status notifications to iOS devices.
            </span>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-foreground tracking-wide">Data Retention</h2>
        <p className="text-muted-foreground">
          Order data and session tokens are retained until you delete them or we close the service.
          Push tokens are removed when you uninstall the app or revoke notification permission.
          Payment records are kept for as long as legally required.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-foreground tracking-wide">Your Rights</h2>
        <p className="text-muted-foreground">
          You may request deletion of your data at any time by contacting us. Because orders are
          tied to session tokens rather than accounts, you can also clear your browser storage or
          delete the app to remove local identifiers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-foreground tracking-wide">Children</h2>
        <p className="text-muted-foreground">
          This app is not directed at children under 13. We do not knowingly collect personal
          information from children.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-foreground tracking-wide">Changes</h2>
        <p className="text-muted-foreground">
          If we make material changes to this policy, we will update the effective date above. Continued
          use of the app after changes constitutes acceptance.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium text-foreground tracking-wide">Contact</h2>
        <p className="text-muted-foreground">
          Questions about this policy? Email us at{" "}
          <a
            href="mailto:glw765@ymail.com"
            className="text-primary/70 hover:text-primary underline underline-offset-2 transition-colors"
          >
            glw765@ymail.com
          </a>
          .
        </p>
      </section>

      <div className="pt-4 border-t border-primary/10">
        <Link
          href="/"
          className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
        >
          ← Return
        </Link>
      </div>
    </motion.div>
  );
}
