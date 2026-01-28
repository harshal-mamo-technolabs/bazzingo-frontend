import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  registerPushSubscription,
  unregisterPushSubscription,
} from '../services/pushService';
import { VAPID_PUBLIC_KEY } from '../utils/constant';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

function base64UrlDecode(input) {
  if (!input) return '';

  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

  try {
    return atob(padded);
  } catch {
    return '';
  }
}

function extractUserIdFromToken(token) {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  const payloadStr = base64UrlDecode(parts[1]);
  if (!payloadStr) return null;

  try {
    const payload = JSON.parse(payloadStr);
    return payload.userId || payload.sub || payload.id || null;
  } catch {
    return null;
  }
}

function getApplicationServerKey() {
  if (!VAPID_PUBLIC_KEY || typeof VAPID_PUBLIC_KEY !== 'string') {
    throw new Error(
      'Missing VAPID public key. Set VITE_VAPID_PUBLIC_KEY in your .env',
    );
  }

  const keyArray = urlBase64ToUint8Array(VAPID_PUBLIC_KEY.trim());

  if (!(keyArray instanceof Uint8Array) || keyArray.byteLength < 65) {
    throw new Error(
      'Invalid VAPID public key format. Ensure a valid base64url key.',
    );
  }

  return keyArray;
}

export default function usePushNotifications() {
  const { user } = useSelector((state) => state.user || {});
  let userId =
    user?._id ||
    user?.id ||
    user?.userId ||
    extractUserIdFromToken(user?.token) ||
    null;

  // Fallback: load from localStorage
  if (!userId) {
    try {
      const stored = JSON.parse(localStorage.getItem('user'));
      const storedUser = stored?.user;

      userId =
        storedUser?._id ||
        storedUser?.id ||
        storedUser?.userId ||
        extractUserIdFromToken(storedUser?.token) ||
        extractUserIdFromToken(stored?.accessToken) ||
        null;
    } catch {
      // ignore
    }
  }

  const isSupported = useMemo(() => {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    );
  }, []);

  const [permission, setPermission] = useState(
    Notification?.permission || 'default',
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check existing subscription on mount
  useEffect(() => {
    if (!isSupported) return;

    let isMounted = true;

    (async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        const sub = await registration.pushManager.getSubscription();

        if (isMounted) {
          setIsSubscribed(!!sub);
          setPermission(Notification.permission);

          if (sub) {
          }
        }
      } catch (e) {
        if (isMounted) setError(e);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) throw new Error('Push is not supported in this browser.');
    if (!userId) throw new Error('User not available. Please login.');

    setLoading(true);
    setError(null);

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        throw new Error('Notification permission was not granted.');
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: getApplicationServerKey(),
      });

      await registerPushSubscription(subscription);

      setIsSubscribed(true);

      return subscription;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [isSupported, userId]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) throw new Error('Push is not supported in this browser.');
    if (!userId) throw new Error('User not available. Please login.');

    setLoading(true);
    setError(null);

    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();

      if (!subscription) {
        setIsSubscribed(false);
        return;
      }

      const endpoint = subscription.endpoint;

      await subscription.unsubscribe();
      await unregisterPushSubscription(endpoint);

      setIsSubscribed(false);
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [isSupported, userId]);

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
  };
}