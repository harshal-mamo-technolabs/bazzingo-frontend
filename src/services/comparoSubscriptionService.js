import axios from 'axios';

const COMPARO_API_BASE_URL = import.meta.env.VITE_COMPARO_API_BASE_URL;
const COMPARO_API_TOKEN = import.meta.env.VITE_COMPARO_API_TOKEN;

const LANDING_PAGE_URL = import.meta.env.VITE_LANDING_PAGE_URL;

/**
 * @param {string | { userPublicUuid?: string; mobileNumber?: string }} input
 * - String: sent as `{ user_public_uuid }` (legacy).
 * - `{ mobileNumber }`: sent as `{ mobile_number }` (query `?mobile_number=` signup flow).
 * - `{ userPublicUuid }`: sent as `{ user_public_uuid }`.
 */
export async function checkSubscription(input) {
  let body;
  if (input != null && typeof input === 'object' && !Array.isArray(input)) {
    const mobile = input.mobileNumber != null ? String(input.mobileNumber).trim() : '';
    const uuid = input.userPublicUuid != null ? String(input.userPublicUuid).trim() : '';
    if (mobile) {
      body = { mobile_number: mobile };
    } else if (uuid) {
      body = { user_public_uuid: uuid };
    } else {
      throw new Error('checkSubscription: provide userPublicUuid or mobileNumber in the options object');
    }
  } else if (input != null && String(input).trim() !== '') {
    body = { user_public_uuid: String(input).trim() };
  } else {
    throw new Error('checkSubscription: invalid input');
  }

  console.log('[checkSubscription] Begin subscription check');
  console.log('[checkSubscription] Request body keys:', Object.keys(body));
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
  console.log('[checkSubscription] Request body:', body);

  try {
    const response = await axios.post(`${COMPARO_API_BASE_URL}/check-subscription`, body, {
      headers,
      withCredentials: false,
    });

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
