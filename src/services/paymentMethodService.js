import axios from 'axios';
import { API_CONNECTION_HOST_URL, PAYMENT_METHODS_ENDPOINT } from '../utils/constant';

function getAuthHeaders() {
  const userData = localStorage.getItem('user');
  if (!userData) throw new Error('User not authenticated');

  let parsedUserData;
  try {
    parsedUserData = JSON.parse(userData);
  } catch (err) {
    throw new Error('Invalid User Data. Please log in again');
  }

  const token = parsedUserData?.accessToken;
  if (!token) throw new Error('Authentication token not found');

  return { Authorization: `Bearer ${token}` };
}

const url = (suffix = '') => `${API_CONNECTION_HOST_URL}${PAYMENT_METHODS_ENDPOINT}${suffix}`;

export async function getPaymentMethods() {
  const response = await axios.get(url(), { headers: getAuthHeaders() });
  return response.data;
}

export async function createCardSetupIntent() {
  const response = await axios.post(url('/setup-intent'), {}, { headers: getAuthHeaders() });
  return response.data;
}

export async function confirmCardSetup(setupIntentId) {
  const response = await axios.post(
    url('/confirm'),
    { setupIntentId },
    { headers: getAuthHeaders() }
  );
  return response.data;
}

export async function removePaymentMethod(paymentMethodId) {
  const response = await axios.delete(url(`/${paymentMethodId}`), { headers: getAuthHeaders() });
  return response.data;
}

export async function setDefaultPaymentMethod(paymentMethodId) {
  const response = await axios.patch(
    url(`/${paymentMethodId}/default`),
    {},
    { headers: getAuthHeaders() }
  );
  return response.data;
}
