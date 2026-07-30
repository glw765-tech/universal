import { Router, type IRouter } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { sendClaimCode } from "../resendClient";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const RequestCodeBody = z.object({ email: z.string().email() });
const VerifyCodeBody = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  sessionToken: z.string().min(1),
});

// POST /auth/request-code
router.post("/auth/request-code", async (req, res): Promise<void> => {
  const parsed = RequestCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid email address." });
    return;
  }
  const { email } = parsed.data;

  try {
    const code = await storage.createClaimCode(email);
    await sendClaimCode(email, code);
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Failed to send claim code");
    res.status(500).json({ error: "Failed to send code. Please try again." });
  }
});

// POST /auth/verify-code
router.post("/auth/verify-code", async (req, res): Promise<void> => {
  const parsed = VerifyCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }
  const { email, code, sessionToken } = parsed.data;

  try {
    const canonicalToken = await storage.verifyClaimCode(email, code, sessionToken);
    if (!canonicalToken) {
      res.status(400).json({ error: "Invalid or expired code. Please request a new one." });
      return;
    }
    res.json({ sessionToken: canonicalToken });
  } catch (err) {
    logger.error({ err }, "Failed to verify claim code");
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

export default router;
