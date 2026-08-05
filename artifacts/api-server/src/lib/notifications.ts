import { logger } from "./logger";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
  channelId?: string;
}

export async function sendExpoPushNotifications(
  messages: ExpoPushMessage[]
): Promise<void> {
  if (messages.length === 0) return;

  // Expo accepts batches of up to 100
  const chunks: ExpoPushMessage[][] = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chunk),
      });

      if (!response.ok) {
        const text = await response.text();
        logger.warn(
          { status: response.status, body: text },
          "Expo push API returned non-OK response"
        );
        return;
      }

      const result = (await response.json()) as {
        data: Array<{ status: string; message?: string; details?: unknown }>;
      };

      for (const ticket of result.data) {
        if (ticket.status !== "ok") {
          logger.warn({ ticket }, "Expo push ticket error");
        }
      }
    } catch (err) {
      logger.error({ err }, "Failed to send Expo push notifications");
    }
  }
}

export async function sendOrderStatusNotification(
  pushTokens: string[],
  orderId: number,
  status: "in_transit" | "delivered"
): Promise<void> {
  if (pushTokens.length === 0) return;

  const isInTransit = status === "in_transit";
  const title = isInTransit
    ? "✨ Your order is on its way"
    : "🌟 Your intention has manifested";
  const body = isInTransit
    ? "The universe has dispatched your cosmic order. Stay open to receive."
    : "Your cosmic order has been delivered. Your intention is fulfilled.";

  const messages: ExpoPushMessage[] = pushTokens.map((token) => ({
    to: token,
    title,
    body,
    data: { orderId, screen: "track" },
    sound: "default",
    channelId: "order-updates",
  }));

  await sendExpoPushNotifications(messages);
}
