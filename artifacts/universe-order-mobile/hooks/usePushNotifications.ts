import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useSession } from '@/context/session';

const API_BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

async function registerPushToken(sessionToken: string, expoPushToken: string) {
  try {
    await fetch(`${API_BASE}/api/push-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken, expoPushToken }),
    });
  } catch {
    // Non-fatal — app works without push notifications
  }
}

export function usePushNotifications() {
  const { sessionToken } = useSession();
  const registered = useRef(false);

  useEffect(() => {
    if (!sessionToken || registered.current) return;

    async function setup() {
      // Push notifications only work on physical devices
      if (!Device.isDevice) return;

      // Android: create notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('order-updates', {
          name: 'Cosmic Order Updates',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#a78bfa',
        });
      }

      type PermsWithGranted = Awaited<ReturnType<typeof Notifications.getPermissionsAsync>> & { granted: boolean; status: string };
      let existingPerms = await Notifications.getPermissionsAsync() as PermsWithGranted;
      if (!existingPerms.granted && existingPerms.status !== 'granted') {
        existingPerms = await Notifications.requestPermissionsAsync() as PermsWithGranted;
      }

      if (!existingPerms.granted && existingPerms.status !== 'granted') return;

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId as string | undefined;

      let token: string | null = null;
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync(
          projectId ? { projectId } : undefined
        );
        token = tokenData?.data ?? null;
      } catch (err) {
        console.warn('[PushNotifications] Token registration failed:', err);
      }

      if (token && sessionToken) {
        registered.current = true;
        await registerPushToken(sessionToken, token);
      }
    }

    setup().catch(() => {/* non-fatal */});
  }, [sessionToken]);
}
