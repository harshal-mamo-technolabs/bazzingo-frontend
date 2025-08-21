import axios from 'axios';
import {
  API_CONNECTION_HOST_URL,
  PUSH_SUBSCRIBE_ENDPOINT,
  PUSH_UNSUBSCRIBE_ENDPOINT,
} from '../utils/constant';
import store from '../app/store';

function getAuthToken() {
  try {
    const state = store.getState();
    const reduxToken = state?.user?.accessToken || state?.user?.user?.token;
    if (reduxToken) return reduxToken;

    const stored = JSON.parse(localStorage.getItem('user'));
    return stored?.accessToken || stored?.user?.token || null;
  } catch {
    return null;
  }
}

function getOrCreateDeviceId() {
  const key = 'device_id';
  let id = localStorage.getItem(key);
  if (id) return id;

  try {
    id = crypto?.randomUUID
      ? crypto.randomUUID()
      : `dev_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  } catch {
    id = `dev_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  }

  localStorage.setItem(key, id);
  return id;
}

export async function registerPushSubscription(subscription) {
  const token = getAuthToken();
  if (!token) throw new Error('Missing auth token. Please login again.');

  const deviceId = getOrCreateDeviceId();
  const userAgent =
    typeof navigator !== 'undefined' ? navigator.userAgent : undefined;

  return axios.post(
    `${API_CONNECTION_HOST_URL}${PUSH_SUBSCRIBE_ENDPOINT}`,
    { subscription, deviceId, userAgent },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
}

export async function unregisterPushSubscription(endpoint) {
  const token = getAuthToken();
  if (!token) throw new Error('Missing auth token. Please login again.');

  return axios.post(
    `${API_CONNECTION_HOST_URL}${PUSH_UNSUBSCRIBE_ENDPOINT}`,
    { endpoint },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
}
