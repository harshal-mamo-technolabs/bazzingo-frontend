import axios from 'axios';

const COMPARO_API_BASE_URL = import.meta.env.VITE_COMPARO_API_BASE_URL;
const COMPARO_API_TOKEN = import.meta.env.VITE_COMPARO_API_TOKEN;

const LANDING_PAGE_URL = import.meta.env.VITE_LANDING_PAGE_URL;

export async function checkSubscription(sessionId) {
  console.log('[checkSubscription] Begin subscription check');
  console.log('[checkSubscription] sessionId:', sessionId);
  console.log('[checkSubscription] COMPARO_API_BASE_URL:', COMPARO_API_BASE_URL);
  console.log('[checkSubscription] COMPARO_API_TOKEN length:', COMPARO_API_TOKEN?.length);
  console.log(
    '[checkSubscription] COMPARO_API_TOKEN (redacted):',
    COMPARO_API_TOKEN ? `${COMPARO_API_TOKEN.slice(0, 10)}...[redacted]...${COMPARO_API_TOKEN.slice(-10)}` : 'undefined',
  );

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${COMPARO_API_TOKEN}`,
  };

  console.log('[checkSubscription] Request headers:', headers);
  console.log('[checkSubscription] Making POST request to:', `${COMPARO_API_BASE_URL}/check-subscription`);
  console.log('[checkSubscription] Request body:', { user_public_uuid: sessionId });

  try {
    const response = await axios.post(
      `${COMPARO_API_BASE_URL}/check-subscription`,
      { user_public_uuid: sessionId },
      {
        headers,
        withCredentials: false,
      },
    );

    console.log('[checkSubscription] Raw response:', response);
    console.log('[checkSubscription] Response data:', response.data);

    return response.data;
  } catch (error) {
    console.error('[checkSubscription] Error during API call:', error);
    if (error.response) {
      console.error('[checkSubscription] Response error data:', error.response.data);
      console.error('[checkSubscription] Response headers:', error.response.headers);
    }
    throw error;
  }
}

export function isSubscriptionActive(subscriptionStatus) {
  const allowedStatuses = ['OPEN', 'IN_PAYMENT', 'PASSIVE'];
  return allowedStatuses.includes(subscriptionStatus);
}

export function redirectToLandingPage() {
  window.location.href = LANDING_PAGE_URL;
}
