import axios from 'axios';
import { API_CONNECTION_HOST_URL, DATA_EXPORT_ENDPOINT, DELETE_ACCOUNT_ENDPOINT } from "../utils/constant";

function getAuthToken() {
  const userData = localStorage.getItem("user");
  if (!userData) throw new Error("User not authenticated");

  let parsedUserData;
  try {
    parsedUserData = JSON.parse(userData);
  } catch (err) {
    throw new Error("Invalid User Data. Please log in again");
  }

  const token = parsedUserData?.accessToken;
  if (!token) throw new Error("Authentication token not found");

  return token;
}

/**
 * GDPR: Fetch the full personal data export for the authenticated user.
 * Returns the parsed response envelope: { status, message, data: { export } }.
 */
export async function exportUserData() {
  try {
    const token = getAuthToken();
    const response = await axios.get(
      `${API_CONNECTION_HOST_URL}${DATA_EXPORT_ENDPOINT}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user data export:", error);
    throw error;
  }
}

/**
 * Account: permanently delete the authenticated user's account.
 * @param {{ reason?: string, wouldHaveStayedIfOffered?: string[] }} payload
 * The deletion survey (reason for leaving + retention offers).
 * Returns the parsed response envelope. Throws on failure; a 409 means the
 * user still has an active subscription that must be cancelled first.
 */
export async function deleteAccount(payload = {}) {
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${API_CONNECTION_HOST_URL}${DELETE_ACCOUNT_ENDPOINT}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
}
