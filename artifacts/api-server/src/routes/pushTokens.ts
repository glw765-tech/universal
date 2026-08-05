import { Router, type IRouter } from "express";
import { storage } from "../storage";

const router: IRouter = Router();

// POST /push-tokens — register or refresh a push token for a session
router.post("/push-tokens", async (req, res): Promise<void> => {
  const { sessionToken, expoPushToken } = req.body ?? {};
  if (typeof sessionToken !== "string" || !sessionToken) {
    res.status(400).json({ error: "sessionToken is required" });
    return;
  }
  if (typeof expoPushToken !== "string" || !expoPushToken) {
    res.status(400).json({ error: "expoPushToken is required" });
    return;
  }
  // Only accept well-formed Expo push tokens
  if (!expoPushToken.startsWith("ExponentPushToken[") && !expoPushToken.startsWith("ExpoPushToken[")) {
    res.status(400).json({ error: "Invalid Expo push token format" });
    return;
  }

  await storage.upsertPushToken(sessionToken, expoPushToken);
  res.status(201).json({ ok: true });
});

export default router;
