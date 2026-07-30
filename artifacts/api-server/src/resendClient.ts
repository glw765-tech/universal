// Resend email client — wired up after the Resend integration is connected.
// Until then, codes are logged to the console so the feature can be tested locally.

let resend: any = null;

async function getResendClient() {
  if (resend) return resend;
  // Will be replaced with Replit-connector-based Resend client once integration is set up
  return null;
}

export async function sendClaimCode(email: string, code: string): Promise<void> {
  const client = await getResendClient();

  if (!client) {
    // Development fallback — log code so the feature is testable before Resend is wired
    console.log(`[DEV] Claim code for ${email}: ${code}`);
    return;
  }

  await client.emails.send({
    from: "Universe <noreply@orderuniverse.app>",
    to: email,
    subject: "Your cosmic access code",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #1a1a2e;">
        <h1 style="font-size: 24px; font-weight: normal; color: #1a1a2e; margin-bottom: 8px;">Your access code</h1>
        <p style="color: #555; margin-bottom: 32px;">Enter this code to link your orders across devices.</p>
        <div style="background: #f8f4ff; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px;">
          <span style="font-size: 40px; letter-spacing: 12px; font-weight: bold; color: #1a1a2e;">${code}</span>
        </div>
        <p style="color: #888; font-size: 13px;">This code expires in 15 minutes. If you didn't request this, you can safely ignore it.</p>
      </div>
    `,
  });
}
