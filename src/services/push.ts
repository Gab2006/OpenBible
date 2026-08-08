import { supabase } from './supabase';

// Generate or retrieve a persistent device ID
export function getDeviceId(): string {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

// Convert public VAPID key to Uint8Array
export function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
 
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PUBLIC_VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BM2x_z_Xo_1aKxN-R8P5x9gZ1R6i1T2o8R5fXkH8T9J5H1fG8F3w7g2U5d4s1h9k8P5x9gZ1R6i1T2o8R5fXkH8'; // This should be provided by the user in .env

export async function subscribeToPushNotifications(time: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications not supported by browser.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission not granted for Notification');
  }

  const registration = await navigator.serviceWorker.ready;
  
  let subscription = await registration.pushManager.getSubscription();
  
  console.log("Current subscription:", subscription);
  console.log("Using VAPID key:", PUBLIC_VAPID_KEY);

  if (!subscription) {
    console.log("Subscribing to push manager...");
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });
      console.log("Subscription successful:", subscription);
    } catch (err) {
      console.error("PushManager subscribe error:", err);
      // If it fails, maybe unregister the SW and try again?
      throw err;
    }
  }

  const deviceId = getDeviceId();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Call Supabase Edge Function to save subscription
  const { error } = await supabase.functions.invoke('subscribe', {
    body: {
      deviceId,
      subscription,
      notifyTime: time,
      timezone
    }
  });

  if (error) {
    console.error('Error saving subscription:', error);
    throw error;
  }
  
  return true;
}

export async function unsubscribeFromPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    await subscription.unsubscribe();
  }

  const deviceId = getDeviceId();

  // Call Supabase Edge Function to remove subscription
  const { error } = await supabase.functions.invoke('unsubscribe', {
    body: {
      deviceId
    }
  });

  if (error) {
    console.error('Error removing subscription:', error);
  }
}
